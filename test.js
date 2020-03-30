var hammingWeight = function(n) {
    let str = n.toString();
    let count = 0;
    let ret = 0;
    while(count < str.length) {
        console.log(str[count]);
        if(str[count] == '1') {
            ret ++;
        }
        count++;
    }
    return ret;
};


console.log(hammingWeight(11111111111111111111111111111101));