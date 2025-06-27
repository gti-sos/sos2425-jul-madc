import * as fs from "fs";

if (process.env.NODE_ENV === 'production') {
  console.log('Current working directory:', process.cwd());
  console.log('__dirname:', __dirname);
  console.log('Root directory contents:', fs.readdirSync('./'));
  
  // Si quieres ver específicamente el contenido de dist/
  try {
    console.log('dist/ contents:', fs.readdirSync('./dist/'));
  } catch (err) {
    console.log('dist/ directory not found or error:', err.message);
  }
}