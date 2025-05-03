# Express.js Backend

This is the backend for [fb app](https://github.com/jonaszmielke/fb_react) built with **Express.js** and **TypeScript**. It provides user authentication, post management, comments, likes, friendships, and image uploads.

---

## 🛠 Tech Stack

* **Node.js** & **Express.js**
* **TypeScript**
* **PostgreSQL** via **Prisma**
* **JWT** for authentication
* **Multer** for handling multipart/form-data (image uploads)
* **CORS**, **dotenv**, and other standard middleware

---

## 📁 Project Structure

```
src/
├── server.ts                 # Entry point: configures and starts Express server
├── db.ts                     # Sets up Prisma connection pool
├── middleware.ts             # Authentication and logging middleware
├── imageService.ts           # Image naming, storage, and serving
├── unauthenticated.ts        # Public routes: register & login
├── authenticated/            # Protected routes (JWT required)
│   ├── auth_main.ts          # Defines protected routes
│   ├── comment.ts            # Endpoints for comments
│   ├── friends.ts            # Friend request & management
│   ├── like.ts               # Like/unlike functionality
│   ├── post.ts               # CRUD for posts
│   └── user.ts               # Profile update & password change
└── types/
    └── express.d.ts          # Extends Express types - adds user type (from db schema) to Express Request
```


## 🔐 Authentication

* **JWT-based**, stateless sessions.
* Clients must send header: `Authorization: Bearer <token>`.
* Protected routes under `src/authenticated/`


## 📦 Installation

---

1. Clone the repo:

   ```bash
        git clone https://github.com/jonaszmielke/fb_api.git && cd fb-api
   ```


2. Install dependencies:
   ```bash
        npm install
    ```

3. Create `.env` in root with:

   ```dotenv
        DATABASE_URL=postgres\://<user>:<pass>@<host>:<port>/<db>
        JWT_SECRET=<secret>
        PORT=3000
   ```

---



## 🚀 Running

- **Dev mode** (with auto-reload):
  ```bash
npm run dev
````

* **Build & start**:

  ```bash
  ```

npm run build
npm start

```

---

## 📸 Image Uploads

- Uses **multer** for multipart uploads.
- Default storage is local disk; `imageService.ts` manages filenames and access paths.

---

## 📌 API Endpoints

### Public (Unauthenticated)
| Method | Path                    | Description                               |
|--------|-------------------------|-------------------------------------------|
| POST   | `/unauth/signin`        | Sign in and receive JWT                   |
| POST   | `/unauth/signup`        | Register new user and receive JWT         |

### Protected (Require JWT; all paths prefixed with `/api`)

#### Core
| Method | Path                                 | Description                                      |
|--------|--------------------------------------|--------------------------------------------------|
| GET    | `/api/fyp_posts?page={page}`         | Fetch post IDs for your feed (pagination)        |
| GET    | `/api/search?query={text}`           | Search users & posts by text                     |

#### User Routes (`/api/user`)
| Method | Path                                                | Description                                               |
|--------|-----------------------------------------------------|-----------------------------------------------------------|
| GET    | `/api/user/:userid`                                 | Get public profile info                                   |
| GET    | `/api/user/data/:userid`                            | Get profile with friendship status & friends              |
| GET    | `/api/user/posts/:userid?omit=[...]`                | Fetch up to 5 post IDs for feed (omit given IDs)          |
| GET    | `/api/user/posts/list/:userid?page={page}`          | Fetch paginated post IDs                                  |
| GET    | `/api/user/friends/:userid`                         | List up to 9 friends                                      |
| GET    | `/api/user/friends/list/:userid?page={page}`        | Paginated friends list                                    |
| POST   | `/api/user/profile_picture`                         | Upload profile picture (multipart/form-data)              |
| POST   | `/api/user/background`                              | Upload background image (multipart/form-data)             |

#### Post Routes (`/api/post`)
| Method | Path                                 | Description                                           |
|--------|--------------------------------------|-------------------------------------------------------|
| GET    | `/api/post/:postid`                  | Get post details (includes like & comment counts)     |
| POST   | `/api/post`                          | Create new post (text + optional image)               |
| PUT    | `/api/post/:postid`                  | Update post text or image                             |
| DELETE | `/api/post/:postid`                  | Delete a post                                         |
| GET    | `/api/post/isliked/:postid`          | Check if current user liked the post                  |

#### Like Routes (`/api/like`)
| Method | Path                                 | Description                                           |
|--------|--------------------------------------|-------------------------------------------------------|
| POST   | `/api/like/:postid`                  | Like a post                                           |
| DELETE | `/api/like/:postid`                  | Unlike a post                                         |

#### Comment Routes (`/api/comment`)
| Method | Path                                       | Description                               |
|--------|--------------------------------------------|-------------------------------------------|
| GET    | `/api/comment/:postid?page={page}`         | List comments for a post (paginated)      |
| POST   | `/api/comment/:postid`                     | Add comment to a post                     |
| DELETE | `/api/comment/:commentid`                  | Delete a comment                          |

#### Friends Routes (`/api/friends`)
| Method | Path                                                               | Description                                  |
|--------|--------------------------------------------------------------------|----------------------------------------------|
| GET    | `/api/friends?page={page}`                                         | List incoming friend requests                |
| POST   | `/api/friends/invite?receiverid={receiverid}`                      | Send a friend request                        |
| POST   | `/api/friends/accept?friendrequestid={id}`                         | Accept a friend request                      |
| POST   | `/api/friends/reject?friendrequestid={id}`                         | Reject a friend request                      |
| POST   | `/api/friends/cancel?friendrequestid={id}`                         | Cancel sent friend request                   |
| DELETE | `/api/friends/unfriend?friend_id={id}` or `friendship_id={id}`     | Remove an existing friendship                |

---