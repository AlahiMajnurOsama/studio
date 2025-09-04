# ChromaShop - A Vibrant E-commerce Experience

ChromaShop is a modern, full-stack e-commerce application built with Next.js, Firebase, and Tailwind CSS. It provides a seamless shopping experience with features like product browsing, a shopping cart, a wishlist, and a user dashboard.

## Getting Started

To get started with ChromaShop, you'll need to have Node.js and npm installed on your machine.

### Prerequisites

*   Node.js (v18 or later)
*   npm (v8 or later)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/chromashop.git
    ```

2.  Navigate to the project directory:

    ```bash
    cd chromashop
    ```

3.  Install the dependencies:

    ```bash
    npm install
    ```

4.  Set up the environment variables:

    Create a `.env.local` file in the root of the project and add the following environment variables:

    ```bash
    # Firebase Admin SDK credentials
    # Replace the placeholder values with your actual Firebase credentials

    FIREBASE_PROJECT_ID="your-project-id"
    FIREBASE_PRIVATE_KEY_ID="your-private-key-id"
    FIREBASE_PRIVATE_KEY="your-private-key"
    FIREBASE_CLIENT_EMAIL="your-client-email"
    FIREBASE_CLIENT_ID="your-client-id"
    FIREBASE_CLIENT_X509_CERT_URL="your-client-x509-cert-url"
    ```

### Running the Application

To run the application in development mode, use the following command:

```bash
npm run dev
```

This will start the development server at `http://localhost:3000`.

## Project Structure

The project is organized into the following directories:

*   `src/app`: Contains the main application pages and layouts.
*   `src/components`: Contains the reusable React components.
*   `src/context`: Contains the React context providers for managing global state.
*   `src/hooks`: Contains the custom React hooks for managing application logic.
*   `src/lib`: Contains the utility functions and data.
*   `public`: Contains the static assets, such as images and fonts.

## Available Scripts

The following scripts are available in the `package.json` file:

*   `dev`: Starts the development server.
*   `build`: Builds the application for production.
*   `start`: Starts the production server.
*   `lint`: Lints the code using ESLint.
*   `typecheck`: Checks the TypeScript types.
*   `analyze`: Analyzes the bundle size.

## Using the Loader

To ensure a consistent user experience, all asynchronous actions should trigger a global loader. This is handled by the `withLoader` function in the `AppContext`.

To use the loader, import the `useAppContext` hook and wrap your asynchronous action with the `withLoader` function.

### Example

```javascript
import { useAppContext } from '@/context/AppContext';

function MyComponent() {
  const { withLoader } = useAppContext();

  const handleAction = async () => {
    await withLoader(async () => {
      // Your asynchronous code here
      await new Promise(resolve => setTimeout(resolve, 1000));
    });
  };

  return <button onClick={handleAction}>Perform Action</button>;
}
```
