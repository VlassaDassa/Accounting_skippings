

// Проверка на авторизацию
function check_auth() {
    // Изменение кнопки в футере
    if (localStorage.getItem('auth')) {
        $('.footer').html(
            '&copy; 2024 АРМ "Учет успеваемости" | <a class="authBtn logoutBtn">Выход</a> | <a href="#">Руководство пользователя</a> | <a href="#">Разработчик</a>'
        );

        $('.authWrapper').remove()
        if (localStorage.getItem('admin') == 'true') {
            $('.indexTitle').text('Вы авторизованы как - АДМИНИСТРАТОР')
            $('.login-block').append($('<a>', {
                href: "/administrator",
                text: 'Панель администратора'
            }))
        }
        else {
            $('.indexTitle').text(`Вы авторизованы как - СТАРОСТА (${localStorage.getItem('manager')})`)
            $('.login-block').append($('<a>', {
                href: "/manager_panel",
                text: 'Панель старосты'
            }))
        }
    }
    else {
        $('.footer').html(
            '&copy; 2024 АРМ "Учет успеваемости" | <a class="authBtn">Вход</a> | <a href="#">Руководство пользователя</a> | <a href="#">Разработчик</a>'
        );
    }
}

check_auth()



$(document).on('click', '.logoutBtn', function() {
    localStorage.removeItem('admin')
    localStorage.removeItem('auth')
    localStorage.removeItem('manager')

    window.location.replace('/')
})


// Запрос на сервер
function request(url, data='', type='GET', data_type='json') {
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: type,
            url: `/${url}`,
            data: data,
            dataType: data_type,
            success: resolve,
            error: reject
        });
    });
}


