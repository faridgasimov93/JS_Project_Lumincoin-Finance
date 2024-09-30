// function dropDownMenu() {
//     const dropdownToggle = document.querySelector('.dropdown-toggle');
//
//     if (dropdownToggle) {
//         dropdownToggle.addEventListener('click', function (e) {
//             e.preventDefault();
//             this.classList.toggle('clicked');
//
//             const dropdownMenu = this.nextElementSibling;
//             if (dropdownMenu.style.display === 'block') {
//                 dropdownMenu.style.display = 'none';
//             } else {
//                 dropdownMenu.style.display = 'block';
//             }
//         });
//     }
// }
//
// document.addEventListener('DOMContentLoaded', function() {
//     dropDownMenu();
// });
document.getElementById('menu-toggle').addEventListener('click', function () {
    const sidebar = document.querySelector('.custom-sidebar');
    const menuButton = document.querySelector('.menu-toggle');
    sidebar.classList.toggle('show-sidebar');
    menuButton.classList.toggle('show-sidebar');
});