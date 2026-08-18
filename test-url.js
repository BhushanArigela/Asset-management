const url = new URL("http://localhost/api/assets?search=bed&limit=50");
const searchParams = url.searchParams;
console.log(searchParams.get("categoryId"));
console.log(searchParams.get("isDisposed"));
