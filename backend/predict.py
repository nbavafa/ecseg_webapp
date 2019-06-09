from os import listdir
from os.path import isfile, join
import sys
import numpy as np
from skimage import measure
from skimage.io import imread, imshow, imread_collection, concatenate_images
from scipy.ndimage import label, generate_binary_structure, binary_fill_holes
from skimage.color import label2rgb, rgb2gray, gray2rgb
from PIL import Image, ImageTk, ImageDraw, ImageEnhance
import cv2
from skimage.morphology import diamond, opening, binary_dilation, binary_erosion, remove_small_objects
from matplotlib import pyplot as plt
import matplotlib.image as mpimg
from skimage.filters import threshold_minimum
import pydensecrf.densecrf as dcrf
from pydensecrf.utils import unary_from_labels, create_pairwise_bilateral
from keras.models import Model, load_model

def inference(img):
    def crf(original_image, mask_img, gt_prob, compat):
        # Converting annotated image to RGB if it is Gray scale
        annotated_label = mask_img
        colors, labels = np.unique(annotated_label, return_inverse=True)
        n_labels = 4
        #Setting up the CRF model
        original_image = original_image[:1024, :1280, :]
        d = dcrf.DenseCRF2D(original_image.shape[1], original_image.shape[0], n_labels)
        # get unary potentials (neg log probability)
        U = unary_from_labels(labels, n_labels, gt_prob=gt_prob, zero_unsure=False)
        d.setUnaryEnergy(U)
        # This adds the color-independent term, features are the locations only.
        d.addPairwiseGaussian(sxy=(3, 3), compat=compat, kernel=dcrf.DIAG_KERNEL,
                          normalization=dcrf.NORMALIZE_SYMMETRIC)
        #Run Inference for 10 steps
        Q = d.inference(10)
        # Find out the most probable class for each pixel.
        MAP = np.argmax(Q, axis=0)
        return MAP.reshape((original_image.shape[0],original_image.shape[1]))

    #if ecDNA is touching chromosome/nuclei, mark that whole
    #component as that class
    def merge_comp(img, class_id):
        I = img
        if(class_id == 1):
            mask_id = 2
        else:
            mask_id = 1
        temp = I == mask_id
        I[temp] = 0
        O = I
        s = generate_binary_structure(2,2)
        labeled_array, num_features = label(I,  structure=s)
        for i in range(146, num_features):
            ind = (labeled_array == i)
            if(np.any(I[ind]==class_id)):
                O[ind] = class_id
        img[opening(O, diamond(1)) == class_id] = class_id #reset nuclei and chromosomes in main image
        img[temp] = mask_id
        return img

    #fill holes in connected components
    def fill_holes(img, class_id):
        temp = binary_fill_holes(img == class_id)
        img[temp == 1] = class_id
        return img

    #remove ecDNA too small and mark ecDNA that are too large as chromosomes
    def size_thresh(img):
        RP = measure.regionprops(measure.label(img == 3))
        for region in RP:
            if(region.area > 125):
                img[tuple(region.coords.T)] = 2
            if(region.area < 15):
                img[tuple(region.coords.T)] = 0
        return img

    img = fill_holes(fill_holes(fill_holes(img, 1), 2), 3) #fill holes
    img = size_thresh(img)
    img[binary_dilation(img == 3, diamond(1)) ^ binary_erosion(img == 3, diamond(1))] = 0
    img = remove_small_objects(merge_comp(merge_comp(img, 1), 2), min_size = 15)
    #temp = binary_dilation(size_thresh(img)==3, diamond(2))
    #img = crf(imread('./SNU16/1.tif'), img, 0.85, 10)
    #img[temp] = 3
    return img


"""
model: .h5 file containing trained ml model
in_path: the path to the input tiff file
out_path: location to write outputs to
img_name: name of image, without the .tiff
"""
def predict(model, in_path, out_path, img_name):
    #modify to include outpath according to acct
    #onlyfiles = [f for f in listdir('./SNU16/.') if isfile(join('./SNU16/', f))]
    num_classes = 4
    img = imread(in_path)
    img_tosplit = img.copy()
    img_tosplit[:,:,0]=0
    img_tosplit[:,:,1]=0
    #img_tosplit=cv2.cvtColor(img_tosplit, cv2.COLOR_BGR2GRAY)
    plt.imsave(out_path+img_name+".tiff", img_tosplit, cmap='gray')

    crops = []
    y = 1
    x = 1
    dim = 256
    shape = img.shape
    vcrop = int(shape[0]/256)
    hcrop = int(shape[1]/256)
    #image[70:170, 440:540]
    for a in range(0,5):
        y = 1
        for k in range(0,4):
            train = img[y:y+dim, x:x+dim]
            crops.append(train)
            y = y+dim
        x = x+dim
    pred = []
    for i in range(0,len(crops)):
        x = np.expand_dims(crops[i], axis=0)
        comb_pred = np.squeeze(model.predict(x, verbose=0))
        pred.append(comb_pred)
    stitched_im = np.ones((256*vcrop,1,num_classes))
    index = -1
    for j in range (1,hcrop+1):
        index = index +1
        if(index >=hcrop*vcrop):
            break
        row = pred[index]
        for k in range(1,vcrop):
            index = index + 1
            I = pred[index]
            row = np.vstack((row, I))
        stitched_im = np.hstack((stitched_im, row))
    #stitched_im =np.load('./pred/2.npy')
    #img = label2rgb(np.argmax(stitched_im[:, 1:, :], axis=2), bg_label=0)
    img = np.argmax(stitched_im[:, 1:, :], axis=2)
    img = inference(img)

    #outpath = out_path+img_name

    #np.save(out_path+img_name+"_result.tiff", img)

    plt.imsave(out_path+img_name+"_result.tiff", img)

    #convert to pngs so we can display on reactjs
    output_tiff=out_path+img_name+"_result.tiff"
    input_tiff=out_path+img_name+".tiff"

    im=Image.open(input_tiff)
    im = im.convert("L")
    enhancer = ImageEnhance.Brightness(im)
    im = enhancer.enhance(2.5)
    im.save(out_path+img_name+".jpeg", "JPEG", quality=90)

    im=Image.open(output_tiff)
    out = im.convert("RGB")
    out.save(out_path+img_name+"_result.jpeg", "JPEG", quality=90)

    #plt.imsave(out2, img)
    return out_path
