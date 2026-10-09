export type RestMethod = {
  slug: string;
  method: string;
  color: string;
  title: string;
  semantics: string;
  endpoint: string;
  headers: string[];
  request: string;
  response: string;
  status: string;
  idempotency: string;
  cacheability: string;
  uses: string[];
};

export const restMethods: RestMethod[] = [
  {slug:"get",method:"GET",color:"#53d78a",title:"Read a resource or collection",semantics:"Safe and idempotent. GET retrieves a representation without changing server state.",endpoint:"/api/v1/orders?status=paid&limit=20&cursor=eyJpZCI6MTIzfQ",headers:["Accept: application/json","If-None-Match: W/\"orders-v42\""],request:"No request body",response:'{\n  "data": [{ "id": "ord_123", "status": "paid" }],\n  "nextCursor": "eyJpZCI6MTAyfQ"\n}',status:"200 OK",idempotency:"Yes",cacheability:"Yes, when headers permit",uses:["Fetch one resource","Filter a collection","Cursor pagination","Conditional cache revalidation"]},
  {slug:"post",method:"POST",color:"#6c42ef",title:"Create a resource or command",semantics:"POST submits a new representation or starts processing. Add an idempotency key when clients may retry.",endpoint:"/api/v1/orders",headers:["Content-Type: application/json","Idempotency-Key: checkout_8af21"],request:'{\n  "customerId": "usr_42",\n  "items": [{ "sku": "book-1", "quantity": 2 }]\n}',response:'{\n  "id": "ord_123",\n  "status": "created",\n  "version": 1\n}',status:"201 CREATED",idempotency:"With Idempotency-Key",cacheability:"Rarely",uses:["Create a resource","Submit a form","Start a job","Trigger a domain command"]},
  {slug:"put",method:"PUT",color:"#3e9ee8",title:"Replace a complete resource",semantics:"PUT writes the full representation at a known URI and is safe to retry with the same payload.",endpoint:"/api/v1/profiles/usr_42",headers:["Content-Type: application/json","If-Match: \"profile-v7\""],request:'{\n  "displayName": "Ada Lovelace",\n  "bio": "Engineer",\n  "visibility": "public"\n}',response:'{\n  "id": "usr_42",\n  "displayName": "Ada Lovelace",\n  "version": 8\n}',status:"200 OK",idempotency:"Yes",cacheability:"No for request; response may be",uses:["Full replacement","Client-chosen resource ID","Upload known object","Idempotent upsert when specified"]},
  {slug:"patch",method:"PATCH",color:"#eea938",title:"Change selected fields",semantics:"PATCH applies a partial mutation. Define whether the payload uses JSON Merge Patch, JSON Patch, or a domain-specific schema.",endpoint:"/api/v1/profiles/usr_42",headers:["Content-Type: application/merge-patch+json","If-Match: \"profile-v8\""],request:'{\n  "displayName": "Ada L.",\n  "bio": null\n}',response:'{\n  "id": "usr_42",\n  "displayName": "Ada L.",\n  "version": 9\n}',status:"200 OK",idempotency:"Depends on patch operation",cacheability:"No for request",uses:["Partial profile update","State transition fields","JSON Patch operations","Optimistic concurrency"]},
  {slug:"delete",method:"DELETE",color:"#f06464",title:"Remove a resource",semantics:"DELETE makes the target absent. Repeating the request should not create additional side effects.",endpoint:"/api/v1/sessions/ses_91",headers:["Authorization: Bearer <token>","If-Match: \"session-v2\""],request:"No request body",response:"No response body",status:"204 NO CONTENT",idempotency:"Yes",cacheability:"No",uses:["Delete a resource","Revoke a session","Schedule erasure","Remove a relationship"]},
  {slug:"head",method:"HEAD",color:"#b170e8",title:"Read metadata without a body",semantics:"HEAD behaves like GET but returns headers only, useful for existence checks and cache validation.",endpoint:"/api/v1/assets/video-42",headers:["If-None-Match: \"asset-v12\""],request:"No request body",response:"Content-Length: 2489912\nETag: \"asset-v12\"\nLast-Modified: Tue, 06 Oct 2026 10:20:00 GMT",status:"200 OK",idempotency:"Yes",cacheability:"Yes",uses:["Check existence","Validate cache","Inspect size or type","Monitor resource availability"]},
  {slug:"options",method:"OPTIONS",color:"#ea62a5",title:"Discover communication options",semantics:"OPTIONS describes methods and cross-origin capabilities supported by a resource.",endpoint:"/api/v1/orders",headers:["Origin: https://app.example.com","Access-Control-Request-Method: POST"],request:"No request body",response:"Allow: GET, POST, OPTIONS\nAccess-Control-Allow-Origin: https://app.example.com\nAccess-Control-Allow-Methods: GET, POST",status:"204 NO CONTENT",idempotency:"Yes",cacheability:"CORS preflight may be cached",uses:["CORS preflight","Discover allowed methods","Capability inspection","API tooling"]},
];
