const getHashParameters = ()=>{
    var search = (window.location.hash || '').split('?')[1] ? (window.location.hash || '').split('?')[1]:"";
    var arr = search.split('&')
    var params = {}
    for (var i = 0; i < arr.length; i++) {
        var data = arr[i].split('=')
        if (data.length === 2) {
            params[data[0]] = data[1]
        }
    }
    return params
}
const getHashParameter = (key)=>{
    var params = getHashParameters()
    return params[key]
}

export default getHashParameter;