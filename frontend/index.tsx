import React from 'react';
import  { createRoot }  from 'react-dom/client';
import * as ReactDOM from 'react-dom';
import App from './src/App';

// const container = document.getElementById('root');
// const root = createRoot(container);
// root.render(<App/>);

// https://maximorlov.com/deploying-to-github-pages-dont-forget-to-fix-your-links/
ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);