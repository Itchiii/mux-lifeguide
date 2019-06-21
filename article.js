var url_string = window.location.href; // oder nur document.location?
var url = new URL(url_string);
var iddata = url.searchParams.get("id");
console.log(iddata);