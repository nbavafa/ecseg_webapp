from flask import Flask, request
from flask_restful import Resource, Api, reqparse
import os
from os import listdir, path
import sys
scriptpath = "./predict.py"
sys.path.append(os.path.abspath(scriptpath))
import predict
from predict import predict
from keras.models import Model, load_model
from flask_cors import CORS
import json
from flask.json import jsonify
import shutil
from shutil import copyfile
model_path="ecDNA_model_dilated_context.h5"

#launch flask app
app=Flask(__name__)
api=Api(app)
CORS(app)

"""
Post getfiles
Returns a list of jpeg files contained in the user account folder.
"""
@app.route('/getfiles', methods=['POST'])
def post():
    json_input=json.loads(request.data)
    username=json_input['username']
    #file_names=os.listdir("../frontend/public/accounts/"+username+"/")
    file_names=os.listdir("../frontend/public/accounts/"+username+"/")
    tiff_files=[name for name in file_names if '.jpeg' in name]
    not_results=[name for name in tiff_files if '_result' not in name]
    relative_paths=["./accounts/"+username+"/"+name for name in not_results]
    if relative_paths==[]:
        return jsonify({'filelist': ["Error"]})

    return jsonify({'filelist': relative_paths})

"""
Post adduser
Takes in a json file in order to create a new user account (a user folder)
username: Username of person who sent post - this determines which directory to use
"""
@app.route('/adduser', methods=['POST'])
def post2():
    json_input=json.loads(request.data)
    username=json_input['username']
    password=json_input['password']
    if not os.path.isdir("../frontend/public/accounts/"+username+"/"):
        os.mkdir("../frontend/public/accounts/"+username+"/")
        users_json="../frontend/src/Pages/users.json"
        a_dict = {username: password}
        with open(users_json) as f:
            data = json.load(f)
        data.update(a_dict)
        with open(users_json, 'w') as f:
            json.dump(data, f)
    return jsonify({'account_path': "./accounts/"+username+"/"})

"""
Post predict
Takes in a json file in order to call predict(), an ecseg ml software
in_path: Absolute path to a tiff file or a folder containing tiff files
username: Username of person who sent post - this determines which directory to use
"""
@app.route('/predict', methods=['POST'])
def post3():
    json_input = json.loads(request.data)
    in_path=json_input['in_path']
    if not os.path.isdir(in_path) and not os.path.isfile(in_path):
        return jsonify({'pic_list': ["Error"]})

    username=json_input['username']
    file_list=[]
    out_path='../frontend/public/accounts/'+username+'/'
    model = load_model(model_path) #load ml model
    if in_path[len(in_path)-1]=='/': #it's a folder
        for f in listdir(in_path): #go thru all files
            if os.path.isfile(in_path+f) and f[len(f)-5:len(f)]=='.tiff': #it's a tiff
                inner_in_path=in_path+f
                img_name=f[0:-5]
                file_list.append("/accounts/"+username+"/"+img_name+".jpeg")
                copyfile("./example_coords.csv", out_path+img_name+".csv")
                predict(model, inner_in_path, out_path, img_name)

        if len(file_list)==0:
            return jsonify({'pic_list': ["Error"]})
    elif in_path[len(in_path)-5:len(in_path)]=='.tiff': #it's a tiff
        splitt=in_path.split('/')
        img_name=splitt[-1][0:-5]
        file_list.append("/accounts/"+username+"/"+img_name+".jpeg")
        copyfile("./example_coords.csv", out_path+img_name+".csv")
        predict(model, in_path, out_path, img_name)

    #return list of generated files as relative paths from frontend/Pages
    return jsonify({'pic_list': file_list})

"""
Post to download csv from user folder
"""
@app.route('/getcsv', methods=['POST'])
def post4():
    json_input=json.loads(request.data)
    username=json_input['username']
    filename=json_input['filename']
    splitt=filename.split('/')
    csv_name=splitt[-1][0:-5]
    #get the computer username so I can download the file using absolute paths
    curr_path=os.getcwd()
    split_path=curr_path.split("/")
    print(split_path)
    down_path="/"+split_path[1]+"/"+split_path[2]+"/"+"Downloads"+"/"+csv_name+".csv"
    print(down_path)
    shutil.copy("../frontend/public/accounts/"+username+"/"+csv_name+".csv",
             down_path)
    return jsonify({'url':  down_path})


#set the host address
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5444, debug=True)
