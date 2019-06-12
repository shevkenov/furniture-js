function longestWord(str){
    const arr = str.split(' ');
    
    let word = '';
    arr.forEach(element => {
       if(element.langth > word.length){
           word = element
       } 
    });

    return word;
}

console.log(longestWord('How are you baby!'))