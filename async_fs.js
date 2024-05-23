const fs = require('fs')
// --------- Available functions --------
/*
async function: getPathNames
input: String
output: [String] -> list of directories in input
*/
async function getPathNames(dir){
    //Write your code here
      let fileList = [];
      let promise = new Promise ((resolve,reject) => {
      fs.readdir(dir,(error,files) => {
        if (error === null){
          // resolve(files.map(file => {return dir.concat("/",file)}));
          resolve(files.forEach(file => {fileList.push(dir.concat("/",file))}));
        }
        else {
          resolve([]);
        }
      });
    });
  
    await promise;
      return fileList;
  }

/*
async function: getNestedPathNames
input: String
output: [String] -> contains all possible directory names
*/
async function getNestedPathNames (dir){
	//Write your code here
	let curr_dir_paths = await getPathNames(dir); //current directory elements
	if(curr_dir_paths.length == 0){
		return [];
	}
	let promiseList = curr_dir_paths.map(x => getNestedPathNames(x));
	let nestedpaths = await Promise.all(promiseList);
	let newpaths = nestedpaths.reduce(((prev,curr) => [...prev,...curr]),[]);
	return [...curr_dir_paths,...newpaths];
}

/*
async function: readFiles
Input: String
Output: [[String, String]] -> array of sub-arrays with directory and file data
*/
async function readFiles(dir){

    //Write your code here
    let subdirectories_n_files = await getNestedPathNames(dir);
    let promiseList = subdirectories_n_files.map(dir => {
      return new Promise((resolve,reject) => {
        fs.readFile(dir,'utf8',(err,data) => {
          if(err === null){
            resolve([dir,data]);
          }
          else{
            resolve([dir,'']);
          }
        });
      });
    }); 
    let resolved_promises = await Promise.all(promiseList);
    let file_content_pairs = resolved_promises.filter(arr => arr[0].match(/\.[a-z]+/)); //The regex represents the file extension
      return file_content_pairs;
  }


// ---------- search properties ------------------
/*
async function: search
Input: String, String -> dir and token to search
Output: {dir : [Number]} -> directories with corresponding line numbers
*/
findLine = val => {
    return function(file_content_pair) {
        return new Promise( (resolve) => {
            let lines = file_content_pair[1].split('\n');
            
            let matched_lines = [];
            lines.forEach( (line,idx) => {
                if (line.match(val)) {
                    matched_lines.push(idx);
                }
            }); 
            //console.log(file_content_pair[0],matched_lines);
            resolve([file_content_pair[0],matched_lines]);
        });
    }
}

async function search(dir, token){

    //Write your code here
    const file_content_pair_list = await readFiles(dir);
    
    let file_token_line = file_content_pair_list.map(findLine(token));
    let file_token_matches = await Promise.all(file_token_line);
    // console.log(file_token_matches);
    let output_object = {};
    file_token_matches.forEach((entry) => {
        if (entry[1].length != 0 ) {
        output_object[entry[0]] = entry[1];
        }
    });

	return output_object;
}

//------Test--------
var test = async () => {
	await populate_directory(); // initialise custom directories in background
	var names = await readFiles('dir'); // get promise and wait for resolve
	console.log(names); // print output of promise
}
test();