


$('.login-button').on('click', function() {
    let password = $('#password').val()
    let login = $('#login').val()

    if (login.length > 0 && password.length > 0) {
        request('login', {login: login, password: password}, 'POST')
            .then((response) => {
                if (!response.success) {
                    alert('Неверные данные')
                    return
                }
                if (response.admin) {
                    localStorage.setItem('admin', true)
                    localStorage.setItem('auth', true)
                    localStorage.removeItem('manager')

                    window.location.replace('/')
                    return
                }

                localStorage.setItem('admin', false)
                localStorage.setItem('auth', true)
                localStorage.setItem('manager', response.login)

                window.location.replace('/')
            })
            .catch((error) => console.error(error))
    }
    else {
        alert('Введите данные')
    }
})