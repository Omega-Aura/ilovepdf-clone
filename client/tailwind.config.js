/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    red: '#E5322D', // iLovePDF red
                    dark: '#1F1F1F',
                    light: '#F8F9FA',
                }
            }
        },
    },
    plugins: [],
}
