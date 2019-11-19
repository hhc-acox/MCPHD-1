function arrayContains(arr, key){
    for(var index in arr){
       if(arr[index] == key) {
         return true;
       }
    }
    return false;
}
