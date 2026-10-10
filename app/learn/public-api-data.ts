export type ApiEndpoint = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
  path: string;
  title: string;
  auth?: boolean;
  body?: string;
  bodyKind?: "json" | "multipart";
  response?: string;
};

export type ApiCategory = {
  slug: string;
  index: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  endpoints: ApiEndpoint[];
};

const e = (method: ApiEndpoint["method"], path: string, title: string, options: Partial<ApiEndpoint> = {}): ApiEndpoint => ({ method, path, title, response: '{ "success": true, "message": "Request completed", "data": {} }', ...options });

export const publicApiCategories: ApiCategory[] = [
  {slug:"public-data",index:"01",title:"Public data",description:"No-auth datasets for first integrations, cards, search, filters, and pagination.",icon:"◎",color:"#53d78a",endpoints:[
    e("GET","/public/quotes/random","Random quote"),e("GET","/public/quotes","Paginated quotes"),e("GET","/public/randomusers","Random user profiles"),e("GET","/public/randomjokes","Random jokes"),e("GET","/public/randomproducts","Random products"),e("GET","/public/meals","Meal catalog"),e("GET","/public/meals/:id","Meal details"),e("GET","/public/dogs","Dog images"),e("GET","/public/books","Book search"),e("GET","/public/books/:id","Book details"),e("GET","/public/health","Service health"),e("GET","/public/ping","Latency ping")
  ]},
  {slug:"authentication",index:"02",title:"Authentication",description:"Registration, sessions, JWT access/refresh rotation, passwords, and identity boundaries.",icon:"◇",color:"#6c42ef",endpoints:[
    e("POST","/users/register","Register account",{body:'{ "email": "ada@example.com", "password": "StrongPass!42", "name": "Ada" }',bodyKind:"json"}),e("POST","/users/login","Login",{body:'{ "email": "ada@example.com", "password": "StrongPass!42" }',bodyKind:"json"}),e("POST","/users/refresh-token","Rotate access token",{body:'{ "refreshToken": "rt_..." }',bodyKind:"json"}),e("POST","/users/logout","Logout",{auth:true}),e("GET","/users/current-user","Current user",{auth:true}),e("PATCH","/users/change-password","Change password",{auth:true,body:'{ "currentPassword": "...", "newPassword": "..." }',bodyKind:"json"}),e("POST","/users/forgot-password","Request reset",{body:'{ "email": "ada@example.com" }',bodyKind:"json"}),e("POST","/users/reset-password/:token","Complete reset",{body:'{ "password": "NewStrongPass!84" }',bodyKind:"json"})
  ]},
  {slug:"ecommerce",index:"03",title:"E-commerce",description:"Products, categories, carts, addresses, coupons, checkout, orders, and transactional rules.",icon:"▱",color:"#ff8a3d",endpoints:[
    e("GET","/ecommerce/products","List products"),e("GET","/ecommerce/products/:id","Product details"),e("POST","/ecommerce/products","Create product",{auth:true,body:'{ "name": "Mechanical Keyboard", "price": 12900, "stock": 80 }',bodyKind:"json"}),e("PATCH","/ecommerce/products/:id","Update product",{auth:true,body:'{ "stock": 79 }',bodyKind:"json"}),e("DELETE","/ecommerce/products/:id","Delete product",{auth:true}),e("GET","/ecommerce/categories","List categories"),e("GET","/ecommerce/cart","Read cart",{auth:true}),e("POST","/ecommerce/cart/item/:id","Add cart item",{auth:true,body:'{ "quantity": 2 }',bodyKind:"json"}),e("PATCH","/ecommerce/cart/item/:id","Change quantity",{auth:true,body:'{ "quantity": 3 }',bodyKind:"json"}),e("DELETE","/ecommerce/cart/item/:id","Remove cart item",{auth:true}),e("POST","/ecommerce/addresses","Create address",{auth:true,body:'{ "line1": "42 Logic Road", "city": "Bengaluru", "postalCode": "560001" }',bodyKind:"json"}),e("POST","/ecommerce/orders","Checkout order",{auth:true,body:'{ "addressId": "addr_42", "coupon": "SHIP10" }',bodyKind:"json"}),e("GET","/ecommerce/orders","Order history",{auth:true}),e("GET","/ecommerce/orders/:id","Order details",{auth:true})
  ]},
  {slug:"todos",index:"04",title:"Todo CRUD",description:"A complete beginner-to-production CRUD loop with ownership, filtering, and optimistic updates.",icon:"✓",color:"#00aebc",endpoints:[
    e("GET","/todos","List todos",{auth:true}),e("GET","/todos/:id","Todo details",{auth:true}),e("POST","/todos","Create todo",{auth:true,body:'{ "title": "Design API contract", "priority": "high" }',bodyKind:"json"}),e("PATCH","/todos/:id","Update todo",{auth:true,body:'{ "completed": true }',bodyKind:"json"}),e("DELETE","/todos/:id","Delete todo",{auth:true}),e("DELETE","/todos/completed","Clear completed",{auth:true})
  ]},
  {slug:"social",index:"05",title:"Social media",description:"Posts, comments, likes, bookmarks, profiles, follows, feeds, and cursor pagination.",icon:"⌁",color:"#ef5a97",endpoints:[
    e("GET","/social-media/posts","Explore posts"),e("GET","/social-media/posts/:id","Post details"),e("POST","/social-media/posts","Create text post",{auth:true,body:'{ "content": "Shipping a new system design today." }',bodyKind:"json"}),e("PATCH","/social-media/posts/:id","Edit post",{auth:true,body:'{ "content": "Updated post." }',bodyKind:"json"}),e("DELETE","/social-media/posts/:id","Delete post",{auth:true}),e("POST","/social-media/comments/post/:id","Comment",{auth:true,body:'{ "content": "Clear trade-off!" }',bodyKind:"json"}),e("DELETE","/social-media/comments/:id","Delete comment",{auth:true}),e("POST","/social-media/like/post/:id","Like post",{auth:true}),e("DELETE","/social-media/like/post/:id","Unlike post",{auth:true}),e("POST","/social-media/bookmarks/:id","Bookmark post",{auth:true}),e("GET","/social-media/feed","Personal feed",{auth:true}),e("POST","/social-media/follow/:userId","Follow user",{auth:true})
  ]},
  {slug:"files-media",index:"06",title:"Images and files",description:"Multipart images, multiple files, signed uploads, metadata, validation, streaming, and deletion.",icon:"▧",color:"#b26cff",endpoints:[
    e("POST","/media/images","Upload one image",{auth:true,body:"image=<binary>\nalt=Architecture diagram",bodyKind:"multipart",response:'{ "success": true, "data": { "id": "img_42", "url": "https://cdn.example.com/img_42.webp", "width": 1600, "height": 900 } }'}),e("POST","/media/images/batch","Upload multiple images",{auth:true,body:"images=<binary[]>\nalbum=system-design",bodyKind:"multipart"}),e("POST","/media/files","Upload any allowed file",{auth:true,body:"file=<binary>\npurpose=attachment",bodyKind:"multipart"}),e("POST","/media/uploads/sign","Create signed upload",{auth:true,body:'{ "filename": "diagram.png", "contentType": "image/png", "size": 482019 }',bodyKind:"json"}),e("GET","/media/:id","Media metadata",{auth:true}),e("DELETE","/media/:id","Delete media",{auth:true})
  ]},
  {slug:"http-kitchen-sink",index:"07",title:"HTTP kitchen sink",description:"Exercise every HTTP method, headers, cookies, redirects, delays, caching, and error behavior.",icon:"⚡",color:"#e9aa31",endpoints:[
    e("GET","/kitchen-sink/http-methods/get","GET echo"),e("POST","/kitchen-sink/http-methods/post","POST echo",{body:'{ "hello": "world" }',bodyKind:"json"}),e("PUT","/kitchen-sink/http-methods/put","PUT echo",{body:'{ "replace": true }',bodyKind:"json"}),e("PATCH","/kitchen-sink/http-methods/patch","PATCH echo",{body:'{ "field": "value" }',bodyKind:"json"}),e("DELETE","/kitchen-sink/http-methods/delete","DELETE echo"),e("HEAD","/kitchen-sink/http-methods/head","HEAD metadata"),e("OPTIONS","/kitchen-sink/http-methods/options","OPTIONS capabilities"),e("GET","/kitchen-sink/headers","Header echo"),e("GET","/kitchen-sink/cookies","Cookie echo"),e("GET","/kitchen-sink/status/:code","Custom status"),e("GET","/kitchen-sink/delay/:ms","Delayed response")
  ]},
];

export const publicApiEndpointCount = publicApiCategories.reduce((sum, category) => sum + category.endpoints.length, 0);
