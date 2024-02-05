module.exports = {
  Electronic: Electronics,
  Clothing: Clothing,
  Funiture: Furniture,
};

/*
const requireModule = require.context("../store/modules/", true, /\.js$/);
const modules = {};

requireModule.keys().forEach((fileName) => {
  // Use index to prevent duplicates of the same module folder...
  if (fileName.includes("index")) {
    // now I just want the folder name for the module registration
    const moduleName = fileName.replace(/(\.\/|\/.+\.js)/g, "");
    modules[moduleName] = requireModule(fileName);
  }
});

// Đại khái nó sẽ quét toàn bộ file trong thư mục, mình có thể để subfix gì đó để phân biệt cái mình muốn, sau đó mình có name file, từ đó mỗi lần định nghĩa thêm thằng mới chỉ cần tạo file đúng chuẩn subfix đó là được mà k cần phải tự đăng ký thêm
*/
