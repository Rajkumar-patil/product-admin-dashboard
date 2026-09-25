# Admin Dashboard Product App

This project is a simple React + Vite frontend for the product management assignment. It connects to the DummyJSON API for login and product operations while keeping the code easy to understand and explain in an interview.

## Technologies

- React
- Vite
- React Router
- Tailwind CSS
- Axios
- DummyJSON API

## Installation

```bash
npm install
```

## How to run

```bash
npm run dev
```

Then open the local URL shown in the terminal.

## Login credentials

- Username: emilys
- Password: emilyspass

## Features completed

- Login with validation and loading state
- Shared Axios instance with token interceptor and response handling
- Protected routes for all product pages
- Product listing with table on desktop and card layout on mobile
- Pagination with page numbers, previous/next controls, and page size selector
- Debounced search with stale-response protection
- Category filter and sorting by price, rating, and title
- URL-based state for page, search, category, and sort values
- Product details page with image gallery and reviews
- Add product, edit product, and delete product flows
- Loading, empty, and error states
- Logout flow

## DummyJSON API information

The application uses the public DummyJSON API at https://dummyjson.com.

## Search + category limitation and chosen approach

DummyJSON does not allow a single request to search and filter by category at the same time. This app handles that rule with a simple approach:

- If a search query exists, it calls the search endpoint: /products/search?q=
- If the search query is empty, it uses the category endpoint when a category is selected

This keeps the behavior predictable and matches the assignment requirement.

## DummyJSON CRUD limitation

DummyJSON does not permanently save created, updated, or deleted products. Because of that, the app keeps local changes in browser localStorage so the UI immediately reflects the latest state after add/edit/delete actions. The code does not claim the server permanently persists those changes.

## How local UI changes are handled

The app stores newly created or updated product data in browser localStorage. This makes the UI feel consistent even though DummyJSON resets the changes after the request lifecycle. The same approach is also used after deleting products so the user can see the updated list immediately.

## How stale search responses are prevented

Each product request is tracked with a request ID. Older responses are ignored if a newer search request starts later. This prevents an older search result from replacing the latest result when a user types quickly.

## How invalid URL parameters are handled

The app reads query values from the URL and validates them before using them. Invalid values fall back to defaults, and the page is kept in a safe range so values like ?page=abc or ?page=999 do not crash the app.

## How duplicate Login/Save/Delete requests are prevented

The app uses loading flags and guard checks before sending duplicate calls. This prevents double-clicking the login button, save button, or delete button from making repeated API requests.

## One problem faced and how it was solved

The main challenge was keeping the page state, search behavior, and URL query parameters aligned while also blocking stale search responses. The solution was to synchronize URL state with React state and to ignore outdated requests by comparing request IDs before updating the UI.

