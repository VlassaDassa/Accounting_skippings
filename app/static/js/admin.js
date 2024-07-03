if (localStorage.getItem('admin') == 'false' || !localStorage.getItem('admin')) {
    if (!($('.container').hasClass('managerPage') && localStorage.getItem('auth'))) {
        alert('Вы не администратор. Уходите')
        window.location.replace('/')
    }
}

if (localStorage.getItem('admin') == 'true') {
    $('.pageTitle').text('Панель управления администратора')
}
else {
    $('.pageTitle').text('Панель управления старосты')
}







// Выбор модели
$('.modelBtnItem').on('click', function() {
    let type = $(this).attr('data-type-btn')
    $('.adminTables').remove()

    $('.modelBtnItem').removeClass('currentBtn')
    $(this).addClass('currentBtn')
    
    switch(type) {
        case 'groups': render_groups(); break
        case 'students': render_students(); break
        case 'period': render_periods(); break
        case 'skipping': render_skipping(); break
        case 'manager': render_manager(); break
    }
})

// Отображение таблицы "Группы"
function render_groups() {
    // Запрос в БД
    request('get_groups')
    .then((response) => {
        if (!response) {
            console.error('Неизвестная ошибка')
            return false
        }

        // Отрисовка
        let data = JSON.parse(response.groups)
        var adminTables = $('<div>', {
            'class': 'adminTables'
        });
        var rowsWrapper = $('<div>', {
            'class': 'rowsWrapper'
        });

        data.forEach((el) => {
            var rowWrapper = $('<div>', {
                'class': 'rowWrapper',
                'data-id': `group_${el.pk}`
            })

            var rowInput = $('<input>', {
                'type': 'text',
                'class': 'rowInput',
                'value': el.fields.group_name
            })

            var deleteIcon = $('<img>', {
                'class': 'deleteRow',
                'src': staticUrl + 'img/delete.svg',
            })

            rowWrapper.append(rowInput, deleteIcon)
            rowsWrapper.append(rowWrapper)
        })

        var addBtn = $('<div>', {
            'class': 'adminTablesBtn addBtn',
            'text': 'Добавить',
            'data-type': 'group'
        })

        adminTables.append(rowsWrapper, addBtn)
        $('.adminPanelWrapper').append(adminTables)
    })
    .catch((error) => {
        console.error(error)
    })
}

// Отображение таблицы "Студенты"
function render_students(group_id=false, group_filter='all') {
    // Запрос в БД
    request('get_groups')
    .then((response) => {
        if (!response) {
            console.error('Неизвестная ошибка')
            return false
        }

        var all_groups = JSON.parse(response.groups)

        var student_url = 'get_students'
        if (group_id) {
            student_url = 'get_students_for_group/' + group_id
        }

        // Запрос в БД
        request(student_url)
        .then((response) => {
            if (!response) {
                console.error('Неизвестная ошибка')
                return false
            }

            // Отрисовка
            let data = response.students

            var adminTables = $('<div>', {
                'class': 'adminTables'
            });
            var rowsWrapper = $('<div>', {
                'class': 'rowsWrapper'
            });

            data.forEach((el, index) => {
                if (index == 0) {
                    render_header(rowsWrapper, Array('ФИО', 'Группа'))
                }

                var longRowWrapper = $('<div>', {
                    'class': 'longRowWrapper',
                    'data-id': `student_${el.student.id}`,
                })

                var deleteLongRowWrapper = $('<div>', {
                    'class': 'deleteLongRowWrapper',
                })
                
                var rowWrapper = $('<div>', {
                    'class': 'rowWrapper rowWrapper--long',
                })

                var dropdown_list = $('<div>', {
                    'class': 'rowWrapper dropdown-list'
                })

                var dropdown_menu = $('<ul>', {
                    'class': 'dropdown-menu'
                })

                dropdown_menu.append($('<li>', {
                    'class': 'dropdownElement dropdownFirstElement'
                }))

                all_groups.forEach((group) => {
                    var dropdownElement = $('<li>', {
                        'class': 'dropdownElement',
                        'data-id': `group_${group.pk}`
                    }).text(group.fields.group_name)

                    dropdown_menu.append(dropdownElement)
                })

                var rowInput = $('<input>', {
                    'type': 'text',
                    'class': 'rowInput',
                    'value': el.student.fullname
                })

                var dropdownInput = $('<input>', {
                    'type': 'text',
                    'class': 'rowInput',
                    'value': el.group.group_name,
                    'data-id': `group_${el.group.id}`,
                    'readonly': true
                })

                var deleteIcon = $('<img>', {
                    'class': 'deleteRow',
                    'src': staticUrl + 'img/delete.svg',
                })

                dropdown_list.append(dropdownInput, dropdown_menu)
                rowWrapper.append(rowInput)
                deleteLongRowWrapper.append(rowWrapper, dropdown_list)
                longRowWrapper.append(deleteLongRowWrapper, deleteIcon)
                rowsWrapper.append(longRowWrapper)
            })

            var btnsWrapper = $('<div>', {
                'class': 'btnsWrapper',
            })

            var addBtn = $('<div>', {
                'class': 'adminTablesBtn addBtn',
                'text': 'Добавить',
                'data-type': 'student'
            })

            btnsWrapper.append(addBtn)
            adminTables.append(rowsWrapper, btnsWrapper)

            // Фильтр по группе
            var dropdown_list_filter = $('<div>', {
                'class': 'rowWrapper dropdown-list dropdown-list--filter'
            })

            var dropdown_menu_filter = $('<ul>', {
                'class': 'dropdown-menu'
            })

            dropdown_menu_filter.append($('<li>', {
                'class': 'dropdownElement dropdownFirstElement'
            }))

            dropdown_menu_filter.append($('<li>', {
                'class': 'dropdownElement dropdownElement--filter',
                'data-id': `all`
            }).text('Все группы'))

            all_groups.forEach((group) => {
                var dropdownElement_filter = $('<li>', {
                    'class': 'dropdownElement dropdownElement--filter',
                    'data-id': `group_${group.pk}`
                }).text(group.fields.group_name)

                dropdown_menu_filter.append(dropdownElement_filter)
            })


            if (group_filter == 'all') {
                var dropdownInput_filter = $('<input>', { 
                    'type': 'text',
                    'class': 'rowInput',
                    'value': 'Все группы', 
                    'data-id': `all`,
                    'readonly': true
                })

            }
            else {
                const groupObject = all_groups.find((item) => {
                    return item.pk == group_filter.split('_')[1]
                })

                var dropdownInput_filter = $('<input>', { 
                    'type': 'text',
                    'class': 'rowInput',
                    'value': groupObject.fields.group_name, 
                    'data-id': `group_${group_filter.split('_')[1]}`, 
                    'readonly': true
                })
            }
            

            dropdown_list_filter.append(dropdownInput_filter, dropdown_menu_filter)
            var choiceGroupContainer = $('<div>', {
                'class': 'choiceGroupContainer'
            })
            var labelChoiceGroupContainer = $('<label>', {
                'class': 'labelChoiceGroupContainer'
            }).text('Выберите группу')

            choiceGroupContainer.append(labelChoiceGroupContainer, dropdown_list_filter)

            $(adminTables).prepend(choiceGroupContainer);

            $('.adminPanelWrapper').append(adminTables)
        })
        .catch((error) => {
            console.error(error)
        })
    })
    .catch((error) => {
        console.error(error)
    })
}

// Отображение таблицы "Периоды"
function render_periods(period_name=false) {
    var url = 'get_periods'
    if (period_name) {
        url = 'get_all_period_by_name/' + period_name
    }

    // Запрос в БД
    request(url)
    .then((response) => {
        if (!response) {
            console.error('Неизвестная ошибка')
            return false
        }

        // Отрисовка
        let data = JSON.parse(response.periods)

        var adminTables = $('<div>', {
            'class': 'adminTables'
        });
        var rowsWrapper = $('<div>', {
            'class': 'rowsWrapper'
        });

        data.forEach((el, index) => {
            if (index == 0) {
                render_header(rowsWrapper, Array('Месяц', 'Дата'))
            }

            var longRowWrapper = $('<div>', {
                'class': 'longRowWrapper',
                'data-id': `period_${el.pk}`,
            })

            var deleteLongRowWrapper = $('<div>', {
                'class': 'deleteLongRowWrapper',
            })
            
            var rowWrapper = $('<div>', {
                'class': 'rowWrapper rowWrapper--long',
            })

            var rowInput = $('<input>', {
                'type': 'text',
                'class': 'rowInput',
                'value': el.fields.period,
                'data-id': 'mounth',
            })

            var rowWrapper_date = $('<div>', {
                'class': 'rowWrapper rowWrapper--long',
            })

            var rowInput_date = $('<input>', {
                'type': 'text',
                'class': 'rowInput',
                'value': el.fields.date,
                'data-id': 'date',
            })

            rowWrapper_date.append(rowInput_date)
            rowWrapper.append(rowInput)
            deleteLongRowWrapper.append(rowWrapper, rowWrapper_date)
            longRowWrapper.append(deleteLongRowWrapper)
            rowsWrapper.append(longRowWrapper)
        })

        var btnsWrapper = $('<div>', {
            'class': 'btnsWrapper',
        })

        var addBtn = $('<div>', {
            'class': 'adminTablesBtn addBtn',
            'text': 'Добавить',
            'data-type': 'period'
        })

        btnsWrapper.append(addBtn)
        adminTables.append(rowsWrapper, btnsWrapper)

        // Фильтр по группе
        request('get_periods')
        .then((response) => {
            if (!response) {
                console.error('Неизвестная ошибка')
                return false
            }

            var dropdown_list_filter = $('<div>', {
                'class': 'rowWrapper dropdown-list dropdown-list--filter'
            })

            var dropdown_menu_filter = $('<ul>', {
                'class': 'dropdown-menu'
            })

            dropdown_menu_filter.append($('<li>', {
                'class': 'dropdownElement dropdownFirstElement'
            }))

            dropdown_menu_filter.append($('<li>', {
                'class': 'dropdownElement dropdownElement--periodFilter',
                'data-id': `all`
            }).text('Все периоды'))

            let periods = JSON.parse(response.periods)
            const uniquePeriods = getUniquePeriods(periods);

            uniquePeriods.forEach((period) => {
                var dropdownElement_filter = $('<li>', {
                    'class': 'dropdownElement dropdownElement--periodFilter',
                    'data-id': `group_${period.pk}`
                }).text(period.fields.period)

                dropdown_menu_filter.append(dropdownElement_filter)
            })


            if (!period_name) {
                var dropdownInput_filter = $('<input>', { 
                    'type': 'text',
                    'class': 'rowInput',
                    'value': 'Все периоды', 
                    'data-id': `all`,
                    'readonly': true
                })
            }
            else {
                var dropdownInput_filter = $('<input>', { 
                    'type': 'text',
                    'class': 'rowInput',
                    'value': period_name, 
                    'data-id': `dasdas`,
                    'readonly': true
                })
            }

            
            dropdown_list_filter.append(dropdownInput_filter, dropdown_menu_filter)

            var choiceGroupContainer = $('<div>', {
                'class': 'choiceGroupContainer'
            })

            var labelChoiceGroupContainer = $('<label>', {
                'class': 'labelChoiceGroupContainer'
            }).text('Выберите период')

            choiceGroupContainer.append(labelChoiceGroupContainer, dropdown_list_filter)

            $(adminTables).prepend(choiceGroupContainer);

            $('.adminPanelWrapper').append(adminTables)
        })
        .catch((error) => {
            console.error(error)
        })
    })
    .catch((error) => {
        console.error(error)
    })
   
}

// Отображение таблицы "Пропуски"
function render_skipping() {
    // Запрос в БД "Группы"
    request('get_periods')
    .then((response) => {
        if (!response) {
            console.error('Неизвестная ошибка')
            return false
        }
        var data = JSON.parse(response.periods)

        var unique_periods = new Set();
        var all_periods = [];

        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var period = item["fields"]["period"];
            if (!unique_periods.has(period)) {
                unique_periods.add(period);
                all_periods.push(item);
            }
        }

        // Запрос в БД "Студенты"
        request(('get_students'))
        .then((response) => {
            if (!response) {
                console.error('Неизвестная ошибка')
                return false
            }
            var all_students = response.students

            // Запрос в БД "Пропуски"
            request('get_skippings')
            .then((response) => {
                if (!response) {
                    console.error('Неизвестная ошибка')
                    return false
                }

                // Отрисовка
                let data = response.skippings

                var adminTables = $('<div>', {
                    'class': 'adminTables'
                });
                var rowsWrapper = $('<div>', {
                    'class': 'rowsWrapper'
                });

                data.forEach((el, index) => {
                    if (index == 0) {
                        render_header(rowsWrapper, Array('Студент', 'Период', 'Дата', 'Уваж.', 'Неуваж.', 'Всего'), long=false)
                    }

                    // Запрос в БД. Получение дат по периоду
                    request(`get_all_date_for_period/${el.period.period}`)
                    .then((response) => {
                        var dates = response.dates

                        var longRowWrapper = $('<div>', {
                            'class': 'longRowWrapper',
                            'data-id': `skipping_${el.skipping_id}`,
                        })

                        var deleteLongRowWrapper = $('<div>', {
                            'class': 'deleteLongRowWrapper',
                        })
                        
                        // rowWrapper
                        var rowWrapper_valid = $('<div>', {
                            'class': 'rowWrapper',
                        })

                        var rowWrapper_invalid = $('<div>', {
                            'class': 'rowWrapper',
                        })

                        var rowWrapper_all = $('<div>', {
                            'class': 'rowWrapper',
                        })

                        // dropdown_list
                        var dropdown_list_student = $('<div>', {
                            'class': 'rowWrapper dropdown-list'
                        })

                        var dropdown_list_period = $('<div>', {
                            'class': 'rowWrapper dropdown-list'
                        })

                        var dropdown_list_date = $('<div>', {
                            'class': 'rowWrapper dropdown-list dropdown-list--date'
                        })


                        // dropdown_menu
                        var dropdown_menu_student = $('<ul>', {
                            'class': 'dropdown-menu'
                        })

                        var dropdown_menu_period = $('<ul>', {
                            'class': 'dropdown-menu'
                        })

                        var dropdown_menu_date = $('<ul>', {
                            'class': 'dropdown-menu dropdown-menu--date'
                        })

                        dropdown_menu_student.append($('<li>', {
                            'class': 'dropdownElement dropdownFirstElement'
                        }))

                        dropdown_menu_period.append($('<li>', {
                            'class': 'dropdownElement dropdownFirstElement'
                        }))

                        dropdown_menu_date.append($('<li>', {
                            'class': 'dropdownElement dropdownFirstElement'
                        }))


                        all_periods.forEach((period) => {
                            var dropdownElement = $('<li>', {
                                'class': 'dropdownElement',
                                'data-id': `period_${period.pk}`
                            }).text(period.fields.period)

                            dropdown_menu_period.append(dropdownElement)
                        })


                        all_students.forEach((student) => {
                            var dropdownElement = $('<li>', {
                                'class': 'dropdownElement',
                                'data-id': `student_${student.student.id}`
                            }).text(student.student.fullname)

                            dropdown_menu_student.append(dropdownElement)
                        })

                        dates.forEach((date) => {
                            var dropdownElement = $('<li>', {
                                'class': 'dropdownElement',
                                'data-id': `date`
                            }).text(date)

                            dropdown_menu_date.append(dropdownElement)
                        })


                        // Row input
                        var rowInput_student = $('<input>', {
                            'type': 'text',
                            'class': 'rowInput',
                            'data-id': `student_${el.student.id}`,
                            'value': el.student.fullname,
                            'readonly': true,
                        })

                        var rowInput_period = $('<input>', {
                            'type': 'text',
                            'class': 'rowInput',
                            'value': el.period.period,
                            'data-id': `period_${el.period.id}`,
                            'readonly': true,
                        })

                        var rowInput_date = $('<input>', {
                            'type': 'text',
                            'class': 'rowInput',
                            'value': el.date,
                            'readonly': true,
                        })

                        var rowInput_valid = $('<input>', {
                            'type': 'number',
                            'class': 'rowInput',
                            'data-id': 'valid',
                            'value': el.valid_skipping
                        })

                        var rowInput_invalid = $('<input>', {
                            'type': 'number',
                            'class': 'rowInput',
                            'data-id': 'invalid',
                            'value': el.invalid_skipping
                        })

                        var rowInput_all = $('<input>', {
                            'type': 'number',
                            'class': 'rowInput',
                            'data-id': 'all',
                            'readonly': true,
                            'value': el.all_skipping
                        })
 
                        dropdown_list_student.append(rowInput_student, dropdown_menu_student)
                        dropdown_list_period.append(rowInput_period, dropdown_menu_period)
                        dropdown_list_date.append(rowInput_date, dropdown_menu_date)
                        rowWrapper_valid.append(rowInput_valid)
                        rowWrapper_invalid.append(rowInput_invalid)
                        rowWrapper_all.append(rowInput_all)

                        var deleteIcon = $('<img>', {
                            'class': 'deleteRow',
                            'src': staticUrl + 'img/delete.svg',
                        })

                        deleteLongRowWrapper.append(dropdown_list_student, dropdown_list_period, dropdown_list_date, rowWrapper_valid, rowWrapper_invalid, rowWrapper_all)
                        longRowWrapper.append(deleteLongRowWrapper, deleteIcon)
                        rowsWrapper.append(longRowWrapper)
                        })
                    })

                    var btnsWrapper = $('<div>', {
                        'class': 'btnsWrapper',
                    })

                    var addBtn = $('<div>', {
                        'class': 'adminTablesBtn addBtn',
                        'text': 'Добавить',
                        'data-type': 'skipping'
                    })

                    var reportBtn = $('<div>', {
                        'class': 'adminTablesBtn reportBtn',
                        'text': 'Отчёт',
                        'data-type': 'skipping'
                    })

                    btnsWrapper.append(addBtn, reportBtn)
                    adminTables.append(rowsWrapper, btnsWrapper)
                    $('.adminPanelWrapper').append(adminTables)

                    // Отрисовка фильтров
                    render_filter()
            })
            .catch((error) => {
                console.error(error)
            })
        })
        })
        .catch((error) => {
            console.error(error)
        })

    .catch((error) => {
        console.error(error)
    })

}

// Отображение таблицы "Старосты"
function render_manager() {
    var all_groups

    // Запрос в БД "Группы"
    request('get_groups')
    .then((response) => {
        if (!response) {
            console.error('Неизвестная ошибка')
            return false
        }
        all_groups = JSON.parse(response.groups)
    })
    .catch((error) => {
        console.error(error)
    })

    // Запрос в БД "Студенты"
    request(('get_students'))
    .then((response) => {
        if (!response) {
            console.error('Неизвестная ошибка')
            return false
        }
        var all_students = response.students

        // Запрос в БД "Менеджеры"
        request('get_managers')
        .then((response) => {
            if (!response) {
                console.error('Неизвестная ошибка')
                return false
            }

            // Отрисовка
            let data = response.managers
            var adminTables = $('<div>', {
                'class': 'adminTables'
            });
            var rowsWrapper = $('<div>', {
                'class': 'rowsWrapper'
            });

            data.forEach((el, index) => {
                if (index == 0) {
                    render_header(rowsWrapper, Array('Студент', 'Группа', 'Логин', 'Пароль'), long=false)
                }

                var longRowWrapper = $('<div>', {
                    'class': 'longRowWrapper',
                    'data-id': `manager_${el.manager_id}`,
                })

                var deleteLongRowWrapper = $('<div>', {
                    'class': 'deleteLongRowWrapper',
                })
                
                // rowWrapper
                var rowWrapper_login = $('<div>', {
                    'class': 'rowWrapper',
                })

                var rowWrapper_password = $('<div>', {
                    'class': 'rowWrapper',
                })

                // dropdown_list
                var dropdown_list_student = $('<div>', {
                    'class': 'rowWrapper dropdown-list'
                })

                var dropdown_list_group = $('<div>', {
                    'class': 'rowWrapper dropdown-list'
                })


                // dropdown_menu
                var dropdown_menu_student = $('<ul>', {
                    'class': 'dropdown-menu'
                })

                var dropdown_menu_group = $('<ul>', {
                    'class': 'dropdown-menu'
                })

                dropdown_menu_student.append($('<li>', {
                    'class': 'dropdownElement dropdownFirstElement'
                }))

                dropdown_menu_group.append($('<li>', {
                    'class': 'dropdownElement dropdownFirstElement'
                }))


                all_groups.forEach((group) => {
                    var dropdownElement = $('<li>', {
                        'class': 'dropdownElement',
                        'data-id': `group_${group.pk}`
                    }).text(group.fields.group_name)

                    dropdown_menu_group.append(dropdownElement)
                })


                all_students.forEach((student) => {
                    var dropdownElement = $('<li>', {
                        'class': 'dropdownElement',
                        'data-id': `student_${student.student.id}`
                    }).text(student.student.fullname)

                    dropdown_menu_student.append(dropdownElement)
                })


                // Row input
                var rowInput_student = $('<input>', {
                    'type': 'text',
                    'class': 'rowInput',
                    'data-id': `student_${el.student.id}`,
                    'value': el.student.fullname,
                    'readonly': true,
                })

                var rowInput_group = $('<input>', {
                    'type': 'text',
                    'class': 'rowInput',
                    'value': el.group.group_name,
                    'data-id': `group_${el.group.id}`,
                    'readonly': true,
                })

                var rowInput_login = $('<input>', {
                    'type': 'text',
                    'class': 'rowInput',
                    'data-id': 'login',
                    'value': el.login
                })

                var rowInput_password = $('<input>', {
                    'type': 'text',
                    'class': 'rowInput',
                    'data-id': 'password',
                    'value': el.password
                })

                dropdown_list_student.append(rowInput_student, dropdown_menu_student)
                dropdown_list_group.append(rowInput_group, dropdown_menu_group)
                rowWrapper_login.append(rowInput_login)
                rowWrapper_password.append(rowInput_password)

                var deleteIcon = $('<img>', {
                    'class': 'deleteRow',
                    'src': staticUrl + 'img/delete.svg',
                })

                deleteLongRowWrapper.append(dropdown_list_student, dropdown_list_group, rowWrapper_login, rowWrapper_password)
                longRowWrapper.append(deleteLongRowWrapper, deleteIcon)
                rowsWrapper.append(longRowWrapper)
            })

            var btnsWrapper = $('<div>', {
                'class': 'btnsWrapper',
            })

            var addBtn = $('<div>', {
                'class': 'adminTablesBtn addBtn',
                'text': 'Добавить',
                'data-type': 'manager'
            })

            btnsWrapper.append(addBtn)
            adminTables.append(rowsWrapper, btnsWrapper)
            $('.adminPanelWrapper').append(adminTables)
        })
        .catch((error) => {
            console.error(error)
        })
        
    })
    .catch((error) => {
        console.error(error)
    })
}

// Отображение отчёта
function render_report() {
    request('get_periods')
    .then((response) => {
        if (!response) {
            console.error('Неизвестная ошибка')
            return false
        }

        var unique_periods = new Set();
        var all_mounths = [];

        var data = JSON.parse(response.periods) 

        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var period = item["fields"]["period"];
            if (!unique_periods.has(period)) {
                unique_periods.add(period);
                all_mounths.push(item);
            }
        }

        var all_periods = [['1 семестр', 'first_term'], ['2 семестр', 'second_term'], ['Год', 'year']]

        // Выпадающий список для "Периоды"
        var dropdown_list = $('<div>', {
            'class': 'rowWrapper dropdown-list reportDropdownList rowWrapper--period'
        })
    
        var dropdown_menu = $('<ul>', {
            'class': 'dropdown-menu'
        })
    
        dropdown_menu.append($('<li>', {
            'class': 'dropdownElement dropdownFirstElement'
        }))
    
        all_periods.forEach((period) => {
                var dropdownElement = $('<li>', {
                    'class': 'dropdownElement dropdownElement--reportChoicePeriod',
                    'data-id': `period_${period[1]}`
                }).text(period[0])
    
                dropdown_menu.append(dropdownElement)
        })

        all_mounths.forEach((mounth) => {
            var dropdownElement = $('<li>', {
                'class': 'dropdownElement dropdownElement--reportChoicePeriod dropdownElement--mounth',
                'data-id': `period_${mounth.fields.period}`
            }).text(mounth.fields.period)

            dropdown_menu.append(dropdownElement)
        })

        var labelForDropDownInput = $('<label>', {
            'class': 'groupInputLabel'
        }).text('Выберите период')
    
        var dropdownInput = $('<input>', {
            'type': 'text',
            'class': 'rowInput',
            'value': 'Год',
            'data-id': `period_year`,
            'readonly': true
        })
        dropdown_list.append(dropdown_menu, dropdownInput)


        // Выпадающий спиоск для "Даты"
        var dropdown_list_date = $('<div>', {
            'class': 'rowWrapper dropdown-list reportDropdownList rowWrapper--date'
        })
    
        var dropdown_menu_date = $('<ul>', {
            'class': 'dropdown-menu'
        })
    
        dropdown_menu_date.append($('<li>', {
            'class': 'dropdownElement dropdownFirstElement'
        }))

        dropdown_menu_date.append($('<li>', {
            'class': 'dropdownElement dropdownElement--reportChoiceDate',
            'data-id': `date_no`
        }).text('Не выбрано'))
    

        var labelForDropDownInput_date = $('<label>', {
            'class': 'groupInputLabel'
        }).text('Выберите дату')
    
        var dropdownInput_date = $('<input>', {
            'type': 'text',
            'class': 'rowInput',
            'value': 'Не выбрано',
            'data-id': `date_no`,
            'readonly': true
        })
    
        dropdown_list_date.append(dropdown_menu_date, dropdownInput_date)


        var reportModal = $('<div>').addClass('reportModal');
        var closeButton = $('<div>').addClass('closeButton').text('×');
        var inputReportWrapper = $('<div>').addClass('inputReportWrapper');
        var userInputGroup = $('<div>').addClass('userInputGroup');
        var groupInputLabel = $('<label>').addClass('groupInputLabel').attr('for', 'groupInput').text('Введите группу');
        var groupInput = $('<input>').attr({type: 'text', id: 'groupInput', class: 'rowInput'});

        userInputGroup.append(groupInputLabel, groupInput);
        inputReportWrapper.append(userInputGroup, labelForDropDownInput, dropdown_list, labelForDropDownInput_date, dropdown_list_date);
        var reportModalTitle = $('<h1>').addClass('reportModalTitle').text('Отчёт по группе');

        reportModal.append(closeButton, inputReportWrapper, reportModalTitle);
        $('body').append(reportModal)


    })
    .catch((error) => {
        console.error(error)
    })
}


// Отображение шапки таблицы
function render_header(rowsWrapper, header_el=Array('ФИО', 'Группа'), long=true) {
    var longRowWrapper = $('<div>', {
        'class': 'longRowWrapper tableHeader',
        'data-id': 'none',
    })

    var deleteLongRowWrapper = $('<div>', {
        'class': 'deleteLongRowWrapper',
    })

    header_el.forEach((elem) => {
        var rowWrapper = $('<div>', {
            'class': long ? 'rowWrapper rowWrapper--long' : 'rowWrapper',
        }).text(elem)

        var rowInput = $('<input>', {
            'type': 'text',
            'class': 'rowInput rowInputHidden',
        })

        rowWrapper.append(rowInput)
        deleteLongRowWrapper.append(rowWrapper)
    })

    longRowWrapper.append(deleteLongRowWrapper)
    rowsWrapper.append(longRowWrapper)
}

// Удаление элемента из БД
$(document).on('click', '.deleteRow', function() {
    if ($(this).closest('.longRowWrapper').length > 0) {
        let parent = $(this).closest('.longRowWrapper')
        let type = parent.attr('data-id').split('_')[0]
        let id = parent.attr('data-id').split('_')[1]

        switch(type) {
            case 'student':
                request(`remove_student/${id}`)
                .then((response) => {
                    if (!response) {
                        console.error('Неизвестная ошибка')
                        return false
                    }
                    parent.remove()
                })
                .catch((error) => {
                    console.error(error)
                })
                break

            case 'manager':
                request(`remove_manager/${id}`)
                .then((response) => {
                    if (!response) {
                        console.error('Неизвестная ошибка')
                        return false
                    }
                    parent.remove()
                })
                .catch((error) => {
                    console.error(error)
                })
                break

            case 'skipping':
                request(`remove_skipping/${id}`)
                .then((response) => {
                    if (!response) {
                        console.error('Неизвестная ошибка')
                        return false
                    }
                    parent.remove()
                })
                .catch((error) => {
                    console.error(error)
                })
                break
        }

        if ($('.longRowWrapper').length == 2) {
            $('.tableHeader').remove()
        }

        return
    }

    let parent = $(this).closest('.rowWrapper')
    let type = parent.attr('data-id').split('_')[0]
    let id = parent.attr('data-id').split('_')[1]

    switch(type) {
        case 'group':
            request(`remove_group/${id}`)
            .then((response) => {
                if (!response) {
                    console.error('Неизвестная ошибка')
                    return false
                }
                parent.remove()
            })
            .catch((error) => {
                console.error(error)
            })
            break

        case 'period':
            request(`remove_period/${id}`)
            .then((response) => {
                if (!response) {
                    console.error('Неизвестная ошибка')
                    return false
                }
                parent.remove()
            })
            .catch((error) => {
                console.error(error)
            })
            break
    }

});


// Добавление записи в БД
$(document).on('click', '.addBtn', function() {
    let type = $(this).attr('data-type')

    // Запрос в БД
    request('get_groups')
    .then((response) => {
        if (!response) {
            console.error('Неизвестная ошибка')
            return false
        }

        var all_groups = JSON.parse(response.groups)
        switch(type) {
            case 'group': 
                var rowWrapper = $('<div>', {
                    'class': 'rowWrapper',
                    'data-id': `none`
                })
    
                var rowInput = $('<input>', {
                    'type': 'text',
                    'class': 'rowInput',
                })
    
                var deleteIcon = $('<img>', {
                    'class': 'deleteRow',
                    'src': staticUrl + 'img/delete.svg',
                })
    
                rowWrapper.append(rowInput, deleteIcon)
                $('.rowsWrapper').append(rowWrapper)
    
                rowInput.focus()
                rowInput.on('blur', function(event) {
                    let value = $(this).val() 
                    if (!value) {
                        $(this).closest('.rowWrapper').remove();
                        return
                    }
                    
                    request('add_group', {'group_name': value}, 'POST')
                    .then((response) => {
                        if (!response) {
                            console.error('Неизвестная ошибка')
                            return false
                        }
    
                        if (response.success) {
                            $(this).closest('.rowWrapper').attr('data-id', `group_${response.new_elem_id}`)
                        }
                    })
                    .catch((error) => {
                        console.error(error)
                    })
                });
    
                break

            case 'period': 
                var longRowWrapper = $('<div>', {
                    'class': 'longRowWrapper',
                    'data-id': `none`,
                })

                var deleteLongRowWrapper = $('<div>', {
                    'class': 'deleteLongRowWrapper',
                })
                
                var rowWrapper = $('<div>', {
                    'class': 'rowWrapper rowWrapper--long',
                })


                var default_value = $('.dropdown-list--filter').find('.rowInput').val()
                if (default_value == 'Все периоды') {
                    default_value = ''
                }
                var rowInput = $('<input>', {
                    'type': 'text',
                    'class': 'rowInput',
                    'value': default_value,
                    'data-id': 'mounth',
                })

                var rowWrapper_date = $('<div>', {
                    'class': 'rowWrapper rowWrapper--long',
                })

                var rowInput_date = $('<input>', {
                    'type': 'text',
                    'class': 'rowInput',
                    'data-id': 'date',
                })

                rowWrapper_date.append(rowInput_date)
                rowWrapper.append(rowInput)
                deleteLongRowWrapper.append(rowWrapper, rowWrapper_date)
                longRowWrapper.append(deleteLongRowWrapper)
                $('.rowsWrapper').append(longRowWrapper)
    
                rowInput.focus()
                rowInput.on('blur', function(event) {
                    var value = $(this).val() 
                    var date = $(this).closest('.longRowWrapper').find('[data-id^="date"]').val()
                    if (!value) {
                        $(this).closest('.longRowWrapper').remove();
                        return
                    }
                    
                    request('add_period', {'period': value, 'date': date}, 'POST')
                    .then((response) => {
                        if (!response) {
                            console.error('Неизвестная ошибка')
                            return false
                        }
                        $(this).off('blur');
                        if (response.success) {
                            $(this).closest('.longRowWrapper').attr('data-id', `period_${response.new_elem_id}`)
                        }
                    })
                    .catch((error) => {
                        console.error(error)
                    })
                });
    
                break

            case 'student':
                if (all_groups.length == 0) {
                    alert('Добавьте хотя бы одну запись в таблицу "Группы"')
                    return
                }

                var longRowWrapper = $('<div>', {
                    'class': 'longRowWrapper',
                    'data-id': 'student',
                })
    
                var deleteLongRowWrapper = $('<div>', {
                    'class': 'deleteLongRowWrapper',
                })
    
                var rowWrapper = $('<div>', {
                    'class': 'rowWrapper rowWrapper--long',
                })
    
                var dropdown_list = $('<div>', {
                    'class': 'rowWrapper dropdown-list'
                })
    
                var dropdown_menu = $('<ul>', {
                    'class': 'dropdown-menu'
                })
    
                dropdown_menu.append($('<li>', {
                    'class': 'dropdownElement dropdownFirstElement'
                }))
                
                all_groups.forEach((group) => {
                    var dropdownElement = $('<li>', {
                        'class': 'dropdownElement',
                        'data-id': `group_${group.pk}`
                    }).text(group.fields.group_name)
    
                    dropdown_menu.append(dropdownElement)
                })
    
                var rowInput = $('<input>', {
                    'type': 'text',
                    'class': 'rowInput',
                })
                

                const cur_group = $('.dropdown-list--filter').find('.rowInput').attr('data-id')

                if (cur_group == 'all') {
                    var dropdownInput = $('<input>', {
                        'type': 'text',
                        'class': 'rowInput',
                        'value': all_groups[0].fields.group_name,
                        'data-id': `group_${all_groups[0].pk}`
                    })
                }

                else {
                    const cur_group_id = cur_group.split('_')[1]
                    const cur_group_name = all_groups.find((item) => {
                        return item.pk == cur_group_id
                    }).fields.group_name

                    var dropdownInput = $('<input>', {
                        'type': 'text',
                        'class': 'rowInput',
                        'value': cur_group_name,
                        'data-id': `group_${cur_group_id}`
                    })
                }

                
    
                var deleteIcon = $('<img>', {
                    'class': 'deleteRow',
                    'src': staticUrl + 'img/delete.svg',
                })

                dropdown_list.append(dropdownInput, dropdown_menu)
                rowWrapper.append(rowInput)
                deleteLongRowWrapper.append(rowWrapper, dropdown_list)
                longRowWrapper.append(deleteLongRowWrapper, deleteIcon)

                if ($('.longRowWrapper').length > 0) {
                    $('.rowsWrapper').append(longRowWrapper)
                }

                else {
                    render_header($('.rowsWrapper'), Array('ФИО', 'Группа'))
                    $('.rowsWrapper').append(longRowWrapper)
                }

                rowInput.focus()
                rowInput.on('blur', function(event) {
                    let value = $(this).val() 
                    if (!value) {
                        $(this).closest('.longRowWrapper').remove();

                        longRowWrapper.remove();
                        if ($('.longRowWrapper').length == 1) {
                            $('.longRowWrapper').remove()
                        }
                        return
                    }
                    
                    var group_id = $(this).closest('.longRowWrapper').find('.dropdown-list').find('.rowInput').attr('data-id').split('_')[1]
                    request('add_student', {'fullname': value, 'group_id': group_id}, 'POST')
                    .then((response) => {
                        if (!response) {
                            console.error('Неизвестная ошибка')
                            return false
                        }
    
                        if (response.success) {
                            $(this).closest('.longRowWrapper').attr('data-id', `student_${response.new_elem_id}`)
                        }
                    })
                    .catch((error) => {
                        console.error(error)
                    })
                });

                break

            case 'manager':
                // Запрос в БД "Студенты"
                request(('get_students'))
                .then((response) => {
                    if (!response) {
                        console.error('Неизвестная ошибка')
                        return false
                    }
                    all_students = response.students
                    // Отрисовка новой записи "Старосты"

                    if (all_groups.length == 0 || all_students.length == 0) {
                        alert('Добавьте хотя бы одну запись в таблицы "Студенты" и "Группы"')
                    }
                    add_manager(all_students, all_groups)

                })
                .catch((error) => {
                    console.error(error)
                })
                break

            case 'skipping':
                request(('get_students'))
                .then((response) => {
                    if (!response) {
                        console.error('Неизвестная ошибка')
                        return false
                    }
                    all_students = response.students

                    request(('get_periods'))
                    .then((response) => {
                        if (!response) {
                            console.error('Неизвестная ошибка')
                            return false
                        }
                        var all_periods = JSON.parse(response.periods)

                        if (all_periods.length == 0 || all_students.length == 0) {
                            alert('Добавьте хотя бы одну запись в таблицы "Студенты" и "Периоды"')
                        }

                        // Отрисовка новой записи "Пропуски"
                        add_skipping(all_students, all_periods)

                    })
                    .catch((error) => {
                        console.error(error)
                    })
                })
                .catch((error) => {
                    console.error(error)
                })
                break
        }
    })
    .catch((error) => {
        console.error(error)
    })
})



// Обновление записи в БД, при focus/unfocus
$(document).on('focus', '.rowInput', function() {
    var $inputElement = $(this);
    $inputElement.data('originalValue', $inputElement.val());

    $('.rowInput').removeClass('selectRowInput')
    $inputElement.addClass('selectRowInput')
});

$(document).on('blur', '.rowInput', function() {
    var $inputElement = $(this);
    var originalValue = $inputElement.data('originalValue');
    var currentValue = $inputElement.val();
    $('.rowInput').removeClass('selectRowInput')
    
    // Запрос в БД
    if (originalValue !== currentValue) {
        try {
            var parent = $inputElement.closest('.rowWrapper')
            var elem_id = parent.attr('data-id').split('_')[1]
            var type = parent.attr('data-id').split('_')[0]
        }
        catch {
            var parent = $inputElement.closest('.longRowWrapper')
            var elem_id = parent.attr('data-id').split('_')[1]
            var type = parent.attr('data-id').split('_')[0]
        }
            

        switch(type) {
            case 'group':
                request(
                    'update_group',
                    {
                        id: elem_id,
                        new_value: currentValue
                    },
                    'POST'
                )
                break

            case 'period':
                request(
                    'update_period',
                    {
                        id: elem_id,
                        new_value: parent.find('[data-id^="mounth"]').val(),
                        date: parent.find('[data-id^="date"]').val()
                    },
                    'POST'
                )
                break
            
            case 'student':
                request(
                    'update_student',
                    {
                        student_id: elem_id,
                        fullname: currentValue,
                        group_id: parent.find('.dropdown-list').find('.rowInput').attr('data-id').split('_')[1]
                    },
                    'POST'
                )
                break

            case 'manager':
                student_id = parent.find('[data-id^="student"]').attr('data-id').split('_')[1]
                group_id = parent.find('[data-id^="group"]').attr('data-id').split('_')[1]
                login = parent.find('[data-id="login"]').val()
                password = parent.find('[data-id="password"]').val()

                request(
                    'update_manager',
                    {
                        manager_id: elem_id,
                        student_id: student_id,
                        group_id: group_id,
                        login: login,
                        password: password,
                    },
                    'POST'
                )
                break

            case 'skipping':
                student_id = parent.find('[data-id^="student"]').attr('data-id').split('_')[1]
                period_id = parent.find('[data-id^="period"]').attr('data-id').split('_')[1]
                valid_skipping = parent.find('[data-id="valid"]').val()
                invalid_skipping = parent.find('[data-id="invalid"]').val()
                all_skipping = parent.find('[data-id="all"]').val()
                date = parent.find('.dropdown-list--date').find('.rowInput').val()

                request(
                    'update_skipping',
                    {
                        skipping_id: elem_id,
                        student_id: student_id,
                        period_id: period_id,
                        valid_skipping: valid_skipping,
                        invalid_skipping: invalid_skipping,
                        all_skipping: all_skipping,
                        date: date,
                    },
                    'POST'
                )
                break
        }
    }
});



// Выбор элемента в списке
$(document).on('click', '.dropdownElement', function() {
    // Видимые изменения
    if ($(this).hasClass('dropdownFirstElement')) return

    $(this).parent().find('.dropdownElement').removeClass('dropdownCurrentElement')
    $(this).addClass('dropdownCurrentElement')
    $(this).closest('.rowWrapper').find('.rowInput').val($(this).html())
    $(this).closest('.rowWrapper').find('.rowInput').attr({'data-id': $(this).attr('data-id')})
    

    // Запрос на обновление в БД
    try {
        var type = $(this).closest('.longRowWrapper').attr('data-id').split('_')[0]
    }
    catch(error) {
        console.error(error)
    }

    if ($(this).attr('data-id').split('_')[0] == 'period') {
        let period = $(this).closest('.rowWrapper').find('.rowInput').val()
        request(`get_all_date_for_period/${period}`)
        .then((response) => {

            // Перерисовка списка "Даты"
            $(this).closest('.longRowWrapper').find('.dropdown-menu--date').empty()
            $(this).closest('.longRowWrapper').find('.dropdown-menu--date').append($('<li>', {
                'class': 'dropdownElement dropdownFirstElement'
            }))
            var dates = response.dates
            dates.forEach((date) => {
                var dropdownElement = $('<li>', {
                    'class': 'dropdownElement',
                    'data-id': `date`
                }).text(date)
                
                $(this).closest('.longRowWrapper').find('.dropdown-menu--date').append(dropdownElement)
            })

            $(this).closest('.longRowWrapper').find('.dropdown-list--date').find('.rowInput').val(dates[0])
        })  
        .catch((error) => {
            console.error(error)
        })
    }

    // Фильтрация
    if ($(this).closest('.filterDropdownList').length > 0) {
        filtering($(this))
    }
    

    if ($(this).closest('.reportDropdownList').length > 0) {
        let parent = $('.rowWrapper--date').find('.dropdown-menu')
        parent.find('[data-id="date"]').remove()
        let group_name = $('#groupInput').val() || 'all'
        let date = $('.rowWrapper--date').find('.rowInput').val()
        let period = $('.rowWrapper--period').find('.rowInput').attr('data-id').replace('period_', '')

        // При выборе месяца меняются даты
        if (!['year', 'second_term', 'first_term'].includes(period)) {
            // Отрисовка дат
            request(`get_all_date_for_period/${period}`)
            .then((response) => {
                let dates = response.dates
                dates.forEach((date) => {
                    var dropdownElement = $('<li>', {
                        'class': 'dropdownElement dropdownElement--reportChoiceDate',
                        'data-id': `date`
                    }).text(date)

                    parent.append(dropdownElement)
                })

            })  
            .catch((error) => {
                console.error(error)
            })

        }

        if (group_name == 'all') {
            $('.reportModalTitle').text(`Отчёт по всем группам`)
        }
        else {
            $('.reportModalTitle').text(`Отчёт по группе ${group_name}`)
        }
        

        request(`get_report/${group_name}/${period}/${date}`)
        .then((response) => {
            if (response.success) {
                $('.reportModal').find('.rowsWrapper').remove()
                $('.reportModal').find('.reportPrintBtn').remove()
                render_data_report(response.skippings)
            }
        })
        .catch((error) => {
            console.error(error)
        })
    }

    if ($(this).hasClass('dropdownElement--filter')) {
        $('.adminTables').remove()
        if ($(this).attr('data-id') == 'all') {
            render_students()
        }
        else {
            let group_id = $(this).attr('data-id').split('_')[1]
            render_students(group_id=group_id, group_filter=$(this).attr('data-id')) 
        }
    }


    switch(type) {
        case 'student':
            var group_id = $(this).attr('data-id').split('_')[1]
            var student_id = $(this).closest('.longRowWrapper').attr('data-id').split('_')[1]
            var fullname = $(this).closest('.longRowWrapper').find('.rowInput').first().val()

            request(
                'update_student',
                {
                    student_id: student_id,
                    fullname: fullname,
                    group_id: group_id
                },
                'POST'
            )
            
            break

        case 'manager':
            var student_id = $(this).closest('.longRowWrapper').find('[data-id^="student"]').attr('data-id').split('_')[1]
            var group_id = $(this).closest('.longRowWrapper').find('[data-id^="group"]').attr('data-id').split('_')[1]
            var login = $(this).closest('.longRowWrapper').find('[data-id="login"]').val()
            var password = $(this).closest('.longRowWrapper').find('[data-id="password"]').val()

            request(
                'update_manager',
                {
                    manager_id: $(this).closest('.longRowWrapper').attr('data-id').split('_')[1],
                    student_id: student_id,
                    group_id: group_id,
                    login: login,
                    password: password,
                },
                'POST'
            )
            break

        case 'skipping':
            var student_id = $(this).closest('.longRowWrapper').find('[data-id^="student"]').attr('data-id').split('_')[1]
            var period_id = $(this).closest('.longRowWrapper').find('[data-id^="period"]').attr('data-id').split('_')[1]
            var valid_skipping = $(this).closest('.longRowWrapper').find('[data-id="valid"]').val()
            var invalid_skipping = $(this).closest('.longRowWrapper').find('[data-id="invalid"]').val()
            var all_skipping = $(this).closest('.longRowWrapper').find('[data-id="all"]').val()
            var date = $(this).closest('.longRowWrapper').find('.dropdown-list--date').find('.rowInput').val()

            request(
                'update_skipping',
                {
                    skipping_id: $(this).closest('.longRowWrapper').attr('data-id').split('_')[1],
                    student_id: student_id,
                    period_id: period_id,
                    valid_skipping: valid_skipping,
                    invalid_skipping: invalid_skipping,
                    all_skipping: all_skipping,
                    date: date,
                },
                'POST'
            )
            break
    }
})


// Раскрытие списка
$(document).on('click', '.dropdown-list', function() {
    // Видимые изменения
    $('.dropdown-menu').not($(this).find('.dropdown-menu')).removeClass('dropdown-menu--show')
    $('.rowInput').css('z-index', 1)

    $('.rowInput').css('z-index', 0)
    $(this).find('.rowInput').css('z-index', 2)
    $(this).find('.dropdown-menu').toggleClass('dropdown-menu--show')


    // Получение данных из БД и рендер
})


// Отрисовка новой записи в таблице "Менеджер"
function add_manager(all_students, all_groups) {
    var longRowWrapper = $('<div>', {
        'class': 'longRowWrapper',
        'data-id': `none`,
    })

    var deleteLongRowWrapper = $('<div>', {
        'class': 'deleteLongRowWrapper',
    })
    
    // rowWrapper
    var rowWrapper_login = $('<div>', {
        'class': 'rowWrapper',
    })

    var rowWrapper_password = $('<div>', {
        'class': 'rowWrapper',
    })

    // dropdown_list
    var dropdown_list_student = $('<div>', {
        'class': 'rowWrapper dropdown-list'
    })

    var dropdown_list_group = $('<div>', {
        'class': 'rowWrapper dropdown-list'
    })


    // dropdown_menu
    var dropdown_menu_student = $('<ul>', {
        'class': 'dropdown-menu'
    })

    var dropdown_menu_group = $('<ul>', {
        'class': 'dropdown-menu'
    })

    dropdown_menu_student.append($('<li>', {
        'class': 'dropdownElement dropdownFirstElement'
    }))

    dropdown_menu_group.append($('<li>', {
        'class': 'dropdownElement dropdownFirstElement'
    }))


    all_groups.forEach((group) => {
        var dropdownElement = $('<li>', {
            'class': 'dropdownElement',
            'data-id': `group_${group.pk}`
        }).text(group.fields.group_name)

        dropdown_menu_group.append(dropdownElement)
    })


    all_students.forEach((student) => {
        var dropdownElement = $('<li>', {
            'class': 'dropdownElement',
            'data-id': `student_${student.student.id}`
        }).text(student.student.fullname)

        dropdown_menu_student.append(dropdownElement)
    })

    // Row input
    var rowInput_student = $('<input>', {
        'type': 'text',
        'class': 'rowInput',
        'data-id': `student_${all_students[0].student.id}`,
        'value': all_students[0].student.fullname,
        'readonly': true,
    })

    var rowInput_group = $('<input>', {
        'type': 'text',
        'class': 'rowInput',
        'value': all_groups[0].fields.group_name,
        'data-id': `group_${all_groups[0].pk}`,
        'readonly': true,
    })

    var rowInput_login = $('<input>', {
        'type': 'text',
        'class': 'rowInput',
        'data-id': 'login',
    })

    var rowInput_password = $('<input>', {
        'type': 'text',
        'class': 'rowInput',
        'data-id': 'password',
    })

    dropdown_list_student.append(rowInput_student, dropdown_menu_student)
    dropdown_list_group.append(rowInput_group, dropdown_menu_group)
    rowWrapper_login.append(rowInput_login)
    rowWrapper_password.append(rowInput_password)

    var deleteIcon = $('<img>', {
        'class': 'deleteRow',
        'src': staticUrl + 'img/delete.svg',
    })

    deleteLongRowWrapper.append(dropdown_list_student, dropdown_list_group, rowWrapper_login, rowWrapper_password)
    longRowWrapper.append(deleteLongRowWrapper, deleteIcon)

    if ($('.longRowWrapper').length > 0) {
        $('.rowsWrapper').append(longRowWrapper)
    }

    else {
        render_header($('.rowsWrapper'), Array('Студент', 'Группа', 'Логин', 'Пароль'), long=false)
        $('.rowsWrapper').append(longRowWrapper)
    }


    rowInput_login.focus()
    rowInput_login.on('blur', function(event) {
            if ($(this).val().length > 0) {
                var group_id = $(this).closest('.longRowWrapper').find('[data-id^="group"]').attr('data-id').split('_')[1]
                var student_id = $(this).closest('.longRowWrapper').find('[data-id^="student"]').attr('data-id').split('_')[1]
                var login = $(this).closest('.longRowWrapper').find('[data-id^="login"]').val()
                var password = $(this).closest('.longRowWrapper').find('[data-id^="password"]').val()

                var send_data = {
                    'student_id': student_id, 
                    'group_id': group_id,
                    'login': login,
                    'password': password 
                }

                request('add_manager', send_data, 'POST')
                .then((response) => {
                    if (!response) {
                        console.error('Неизвестная ошибка')
                        return false
                    }

                    if (response.success) {
                        $(this).closest('.longRowWrapper').attr('data-id', `manager_${response.new_elem_id}`)
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
            } else {
                longRowWrapper.remove();
                if ($('.longRowWrapper').length == 1) {
                    $('.longRowWrapper').remove()
                }
            }
    });
}

// Отрисовка новой записи в таблице "Пропуски"
function add_skipping(all_students, all_periods) {
    var longRowWrapper = $('<div>', {
        'class': 'longRowWrapper',
        'data-id': `none`,
    })

    var deleteLongRowWrapper = $('<div>', {
        'class': 'deleteLongRowWrapper',
    })

    var rowWrapper_valid = $('<div>', {
        'class': 'rowWrapper',
    })

    var rowWrapper_invalid = $('<div>', {
        'class': 'rowWrapper',
    })

    var rowWrapper_all = $('<div>', {
        'class': 'rowWrapper',
    })

    // Запрос в БД. Получение дат по периоду
    request(`get_all_date_for_period/${all_periods[0].fields.period}`)
    .then((response) => {
        var dates = response.dates

        // dropdown_list
        var dropdown_list_student = $('<div>', {
            'class': 'rowWrapper dropdown-list'
        })

        var dropdown_list_period = $('<div>', {
            'class': 'rowWrapper dropdown-list'
        })

        var dropdown_list_date = $('<div>', {
            'class': 'rowWrapper dropdown-list dropdown-list--date'
        })


        // dropdown_menu
        var dropdown_menu_student = $('<ul>', {
            'class': 'dropdown-menu'
        })

        var dropdown_menu_period = $('<ul>', {
            'class': 'dropdown-menu'
        })

        var dropdown_menu_date = $('<ul>', {
            'class': 'dropdown-menu dropdown-menu--date'
        })

        dropdown_menu_student.append($('<li>', {
            'class': 'dropdownElement dropdownFirstElement'
        }))

        dropdown_menu_period.append($('<li>', {
            'class': 'dropdownElement dropdownFirstElement'
        }))

        dropdown_menu_date.append($('<li>', {
            'class': 'dropdownElement dropdownFirstElement'
        }))

        var uniquePeriods = getUniquePeriods(all_periods)

        uniquePeriods.forEach((period) => {
            var dropdownElement = $('<li>', {
                'class': 'dropdownElement',
                'data-id': `period_${period.pk}`
            }).text(period.fields.period)

            dropdown_menu_period.append(dropdownElement)
        })


        all_students.forEach((student) => {
            var dropdownElement = $('<li>', {
                'class': 'dropdownElement',
                'data-id': `student_${student.student.id}`
            }).text(student.student.fullname)

            dropdown_menu_student.append(dropdownElement)
        })

        dates.forEach((date) => {
            var dropdownElement = $('<li>', {
                'class': 'dropdownElement',
                'data-id': `date`
            }).text(date)

            dropdown_menu_date.append(dropdownElement)
        })


        // Row input
        var rowInput_student = $('<input>', {
            'type': 'text',
            'class': 'rowInput',
            'data-id': `student_${all_students[0].student.id}`,
            'value': all_students[0].student.fullname,
            'readonly': true,
        })

        var rowInput_period = $('<input>', {
            'type': 'text',
            'class': 'rowInput',
            'value': all_periods[0].fields.period,
            'data-id': `period_${all_periods[0].pk}`,
            'readonly': true,
        })

        var rowInput_valid = $('<input>', {
            'type': 'number',
            'class': 'rowInput',
            'data-id': 'valid',
            'value': 0
        })

        var rowInput_invalid = $('<input>', {
            'type': 'number',
            'class': 'rowInput',
            'data-id': 'invalid',
            'value': 0
        })

        var rowInput_all = $('<input>', {
            'type': 'number',
            'class': 'rowInput',
            'data-id': 'all',
            'readonly': true,
            'value': 0
        })

        var rowInput_date = $('<input>', {
            'type': 'text',
            'class': 'rowInput',
            'value': dates[0],
            'readonly': true,
        })
        

        dropdown_list_student.append(rowInput_student, dropdown_menu_student)
        dropdown_list_period.append(rowInput_period, dropdown_menu_period)
        dropdown_list_date.append(rowInput_date, dropdown_menu_date)
        rowWrapper_valid.append(rowInput_valid)
        rowWrapper_invalid.append(rowInput_invalid)
        rowWrapper_all.append(rowInput_all)

        var deleteIcon = $('<img>', {
            'class': 'deleteRow',
            'src': staticUrl + 'img/delete.svg',
        })

        deleteLongRowWrapper.append(dropdown_list_student, dropdown_list_period, dropdown_list_date, rowWrapper_valid, rowWrapper_invalid, rowWrapper_all)
        longRowWrapper.append(deleteLongRowWrapper, deleteIcon)

        if ($('.longRowWrapper').length > 0) {
            $('.rowsWrapper').append(longRowWrapper)
        }

        else {
            render_header($('.rowsWrapper'), Array('Студент', 'Период', 'Уваж.', 'Неуваж.', 'Всего'), long=false)
            $('.rowsWrapper').append(longRowWrapper)
        }


        rowInput_valid.focus()
        rowInput_valid.on('blur', function(event) {
            if ($(this).val().length > 0) {
                var period_id = $(this).closest('.longRowWrapper').find('[data-id^="period"]').attr('data-id').split('_')[1]
                var student_id = $(this).closest('.longRowWrapper').find('[data-id^="student"]').attr('data-id').split('_')[1]
                var valid_skipping = $(this).closest('.longRowWrapper').find('[data-id^="valid"]').val()
                var invalid_skipping = $(this).closest('.longRowWrapper').find('[data-id^="invalid"]').val()
                var all_skipping = $(this).closest('.longRowWrapper').find('[data-id^="all"]').val()
                var date = $(this).closest('.longRowWrapper').find('.dropdown-list--date').find('.rowInput').val()

                var send_data = {
                    'student_id': student_id, 
                    'period_id': period_id,
                    'valid_skipping': valid_skipping,
                    'invalid_skipping': invalid_skipping,
                    'all_skipping': all_skipping,
                    'date': date,
                }

                request('add_skipping', send_data, 'POST')
                .then((response) => {
                    if (!response) {
                        console.error('Неизвестная ошибка')
                        return false
                    }

                    if (response.success) {
                        $(this).closest('.longRowWrapper').attr('data-id', `skipping_${response.new_elem_id}`)
                        $(this).off('blur');
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
            } else {
                longRowWrapper.remove();
            }
        });
})
.catch((error) => {
    console.error(error)
})
}


// Подсчет поля "Всего"
$(document).on('input', '.rowInput', function() {
    let parent = $(this).closest('.longRowWrapper')
    let valid = parseInt(parent.find('[data-id="valid"]').val()) || 0
    let invalid = parseInt(parent.find('[data-id="invalid"]').val()) || 0

    parent.find('[data-id="all"]').val(valid + invalid)
})

// Закрытие отчёта
$(document).on('click', '.overlay, .closeButton', function() {
    $('.overlay').hide();
    $('.reportModal').remove();
});


// Открытие отчёта
$(document).on('click', '.reportBtn', function() {
    $('.overlay').show()
    render_report()
})


// Отчёт по группе:
var timeoutId;
$(document).on('input', '#groupInput', function() {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(function() {
        let group_name = $('#groupInput').val()
        let date = $('.rowWrapper--date').find('.rowInput').val()
        let period = $('.rowWrapper--period').find('.rowInput').attr('data-id').replace('period_', '')
        $('.reportModalTitle').text(`Отчёт по группе ${group_name}`)


        request(`get_report/${group_name}/${period}/${date}`)
        .then((response) => {
            if (response.success) {
                $('.reportModal').find('.rowsWrapper').remove()
                $('.reportModal').find('.reportPrintBtn').remove()
                render_data_report(response.skippings)
            }
        })
        .catch((error) => {
            console.error(error)
        })
    }, 2000); 
});


// Отображение отчёта по данным
function render_data_report(skippings, student_name=false) {
    var data = skippings
    if (student_name) {
        data = skippings.filter((item) => {
            return item.student == student_name
        })
    }

    var rowsWrapper = $('<div>').addClass('rowsWrapper');
 
     var longRowWrapperHeader = $('<div>').addClass('longRowWrapper tableHeader').attr('data-id', 'report');
     var deleteLongRowWrapperHeader = $('<div>').addClass('deleteLongRowWrapper');
     var rowHeaders = ['Студент', 'Период', 'Уваж', 'Неуваж.', 'Всего', 'Дата'];
 
     rowHeaders.forEach(function(headerText) {
         var rowWrapper = $('<div>').addClass('rowWrapper').text(headerText);
         var input = $('<input>').attr({type: 'text', class: 'rowInput rowInputHidden', readonly: true});
         rowWrapper.append(input);
         deleteLongRowWrapperHeader.append(rowWrapper);
     });
 
     longRowWrapperHeader.append(deleteLongRowWrapperHeader);


    rowsWrapper.append(longRowWrapperHeader)
 
    data.forEach(function(reportItem) {
        var longRowWrapperItem = $('<div>').addClass('longRowWrapper').attr('data-id', 'reportItem');
        var deleteLongRowWrapperItem = $('<div>').addClass('deleteLongRowWrapper');

        Object.keys(reportItem).forEach(function(key) {
            if (key != 'rerender') {
                var rowWrapper = $('<div>').addClass('rowWrapper');
                var input = $('<input>').attr({type: 'text', class: 'rowInput', readonly: true}).val(reportItem[key]);
                rowWrapper.append(input);
                
                deleteLongRowWrapperItem.append(rowWrapper);
            }
        });
        
        var choiceMarker = $('<div>').addClass('choiceStudent').attr({
            'student_name': reportItem.student
        })

        if (student_name) {
            choiceMarker.addClass('choiceStudent--active')
        }

        longRowWrapperItem.append(choiceMarker, deleteLongRowWrapperItem);
        rowsWrapper.append(longRowWrapperItem);
    });

    var reportPrintBtn = $('<div>').addClass('adminTablesBtn reportPrintBtn').text('Печать');

    $('.reportModal').append(rowsWrapper, reportPrintBtn);
}


// Отфильтровывание студентов
$(document).on('click', '.choiceStudent', function(e) {
    const student_name = $(this).attr('student_name')

    let group_name = $('#groupInput').val() || 'all'
    let date = $('.rowWrapper--date').find('.rowInput').val()
    let period = $('.rowWrapper--period').find('.rowInput').attr('data-id').replace('period_', '')

    request(`get_report/${group_name}/${period}/${date}`)
    .then((response) => {
        if (response.success) {
            $('.reportModal').find('.rowsWrapper').remove()
            $('.reportModal').find('.reportPrintBtn').remove()

            if ($(this).hasClass('choiceStudent--active')) {
                render_data_report(response.skippings)
                return
            }
            render_data_report(response.skippings, student_name)

        }
    })
    .catch((error) => {
        console.error(error)
    })

    
})


// Печать отчёта
$(document).on('click', '.reportPrintBtn', function() {
    var group_name = $('#groupInput').val() || 'all'
    let date = $('.rowWrapper--date').find('.rowInput').val()
    let period = $('.rowWrapper--period').find('.rowInput').attr('data-id').replace('period_', '')
    var student_name = 'no';

    if ($('.choiceStudent--active').length > 0) {
        student_name = $('.choiceStudent--active').eq(0).closest('.longRowWrapper').find('.rowInput').eq(0).val() || 'no';
    }

    fetch(`generate_report/${group_name}/${period}/${date}/${student_name}`)
    .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
            iframe.contentWindow.print();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => console.error('Ошибка загрузки отчета:', error));
})

// Отображение фильтров для пропусков
function render_filter() {
    var parent = $('.adminTables')

    var filterWrapper = $('<div>', {
        'class': 'filterWrapper'
    })

    // Получение всех групп
    request('get_groups')
    .then((response) => {
        var all_groups = JSON.parse(response.groups)

        // Получение всех периодов
        request('get_periods')
        .then((response) => {
            var data = JSON.parse(response.periods)

            var unique_periods = new Set();
            var all_periods = [];

            var data = JSON.parse(response.periods) 

            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                var period = item["fields"]["period"];
                if (!unique_periods.has(period)) {
                    unique_periods.add(period);
                    all_periods.push(item);
                }
            }

            // Отрисовка
            // Выпадающий спиоск для "Группы"
            var dropdown_list_group = $('<div>', {
                'class': 'rowWrapper dropdown-list filterDropdownList rowWrapper--filterGroup'
            })
        
            var dropdown_menu_group = $('<ul>', {
                'class': 'dropdown-menu'
            })
        
            dropdown_menu_group.append($('<li>', {
                'class': 'dropdownElement dropdownFirstElement'
            }))

            dropdown_menu_group.append($('<li>', {
                'class': 'dropdownElement dropdownElement--filterChoiceGroup',
                'data-id': `group_no`
            }).text('Не выбрано'))

            all_groups.forEach((group) => {
                var dropdownElement = $('<li>', {
                    'class': 'dropdownElement dropdownElement--filterChoiceGroup',
                    'data-id': `group_${group.pk}`
                }).text(group.fields.group_name)
    
                dropdown_menu_group.append(dropdownElement)
            })

            var labelForDropDownInput_group = $('<label>', {
                'class': 'groupInputLabel groupInputLabel--filter'
            }).text('Группа')
        
            var dropdownInput_group = $('<input>', {
                'type': 'text',
                'class': 'rowInput',
                'value': 'Не выбрано',
                'data-id': `group_no`,
                'readonly': true
            })

            var labelContainerGroup = $('<div>', {
                'class': 'labelContainer'
            })
        
            dropdown_list_group.append(dropdown_menu_group, dropdownInput_group)
            labelContainerGroup.append(labelForDropDownInput_group, dropdown_list_group)


            // Выпадающий спиоск для "Периода"
            var dropdown_list_period = $('<div>', {
                'class': 'rowWrapper dropdown-list filterDropdownList rowWrapper--filterPeriod'
            })
        
            var dropdown_menu_period = $('<ul>', {
                'class': 'dropdown-menu'
            })
        
            dropdown_menu_period.append($('<li>', {
                'class': 'dropdownElement dropdownFirstElement'
            }))

            dropdown_menu_period.append($('<li>', {
                'class': 'dropdownElement dropdownElement--filterChoicePeriod',
                'data-id': `period_no`
            }).text('Не выбрано'))

            var periods = [['Год', 'year'], ['1 семестр', 'first_term'], ['2 семестр', 'second_term']]
            periods.forEach((period) => {
                var dropdownElement = $('<li>', {
                    'class': 'dropdownElement dropdownElement--filterChoicePeriod',
                    'data-id': `period_${period[1]}`
                }).text(period[0])
    
                dropdown_menu_period.append(dropdownElement)
            })

            all_periods.forEach((period) => {
                var dropdownElement = $('<li>', {
                    'class': 'dropdownElement dropdownElement--filterChoicePeriod',
                    'data-id': `period_${period.fields.period}`
                }).text(period.fields.period)
    
                dropdown_menu_period.append(dropdownElement)
            })
        

            var labelForDropDownInput_period = $('<label>', {
                'class': 'groupInputLabel groupInputLabel--filter'
            }).text('Период')
        
            var dropdownInput_period = $('<input>', {
                'type': 'text',
                'class': 'rowInput',
                'value': 'Не выбрано',
                'data-id': `period_no`,
                'readonly': true
            })

            var labelContainerPeriod = $('<div>', {
                'class': 'labelContainer'
            })
        
            dropdown_list_period.append(dropdown_menu_period, dropdownInput_period)
            labelContainerPeriod.append(labelForDropDownInput_period, dropdown_list_period)


            // Выпадающий спиоск для "Даты"
            var dropdown_list_date = $('<div>', {
                'class': 'rowWrapper dropdown-list filterDropdownList rowWrapper--filterDate'
            })
        
            var dropdown_menu_date = $('<ul>', {
                'class': 'dropdown-menu'
            })
        
            dropdown_menu_date.append($('<li>', {
                'class': 'dropdownElement dropdownFirstElement'
            }))

            dropdown_menu_date.append($('<li>', {
                'class': 'dropdownElement dropdownElement--filterChoiceDate',
                'data-id': `date_no`
            }).text('Не выбрано'))


            var labelForDropDownInput_date = $('<label>', {
                'class': 'groupInputLabel groupInputLabel--filter'
            }).text('Дата')
        
            var dropdownInput_date = $('<input>', {
                'type': 'text',
                'class': 'rowInput',
                'value': 'Не выбрано',
                'data-id': `date_no`,
                'readonly': true
            })

            var labelContainerDate = $('<div>', {
                'class': 'labelContainer'
            })
        
            dropdown_list_date.append(dropdown_menu_date, dropdownInput_date)
            labelContainerDate.append(labelForDropDownInput_date, dropdown_list_date)


            // Композиция
            filterWrapper.append(
                labelContainerGroup,

                labelContainerPeriod,

                labelContainerDate,
            )
            parent.prepend(filterWrapper)

        })
        .catch((error) => {
            console.error(error)
        })
    })
    .catch((error) => {
        console.error(error)
    })
}


// Фильтрация
function filtering(this_)  {
    var parent = this_.closest('.dropdown-list')
    var group_name = $('.rowWrapper--filterGroup').find('.rowInput').val() == 'Не выбрано' ? 'all' : $('.rowWrapper--filterGroup').find('.rowInput').val()
    var period = $('.rowWrapper--filterPeriod').find('.rowInput').attr('data-id').replace('period_', '')
    var date = $('.rowWrapper--filterDate').find('.rowInput').val() 

    if (!['first_term', 'second_term', 'year'].includes($('.rowWrapper--filterPeriod').find('.rowInput').attr('data-id').replace('period_', ''))) {
        var period = $('.rowWrapper--filterPeriod').find('.rowInput').val()
    }

    // Новые данные для выпадающего списка с датами
    if (this_.hasClass('dropdownElement--filterChoicePeriod') && !['Не выбрано', 'Год', '1 семестр', '2 семестр'].includes(this_.text())) {
        // Перерисовка
        $('.rowWrapper--filterDate').find('[data-id="date"]').remove()  

        request(`get_all_date_for_period/${period}`)
            .then((response) => {
                let dates = response.dates
                dates.forEach((date) => {
                    var dropdownElement = $('<li>', {
                        'class': 'dropdownElement dropdownElement--reportChoiceDate',
                        'data-id': `date`
                    }).text(date)

                    $('.rowWrapper--filterDate').find('.dropdown-menu').append(dropdownElement)
                })

            })  
            .catch((error) => {
                console.error(error)
            })
    }
    

    if (period == 'Не выбрано') {
        period = 'year'
    }

    // Запрос данных о пропусках
    request(`get_report/${group_name}/${period}/${date}`)
    .then((response) => {
        // Перерисовка
        $('.adminTables').find('.rowsWrapper').remove()
        rerender_skippings(response.skippings)

    })
    .catch((error) => {
        console.error(error)
    })

}


// Перерисовка пропусков
function rerender_skippings(skippings) {
    // Запрос в БД "Группы"
    request('get_periods')
    .then((response) => {
        if (!response) {
            console.error('Неизвестная ошибка')
            return false
        }
        var data = JSON.parse(response.periods)

        var unique_periods = new Set();
        var all_periods = [];

        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var period = item["fields"]["period"];
            if (!unique_periods.has(period)) {
                unique_periods.add(period);
                all_periods.push(item);
            }
        }

        // Запрос в БД "Студенты"
        request(('get_students'))
        .then((response) => {
            if (!response) {
                console.error('Неизвестная ошибка')
                return false
            }
            var all_students = response.students
                
            var rowsWrapper = $('<div>', {
                'class': 'rowsWrapper'
            });

            skippings.forEach((el, index) => {
                if (index == 0) {
                    render_header(rowsWrapper, Array('Студент', 'Период', 'Дата', 'Уваж.', 'Неуваж.', 'Всего'), long=false)
                }

                // Запрос в БД. Получение дат по периоду
                request(`get_all_date_for_period/${el.period}`)
                .then((response) => {
                    var dates = response.dates

                    var longRowWrapper = $('<div>', {
                        'class': 'longRowWrapper',
                        'data-id': `skipping_${el.rerender.skipping_id}`,
                    })

                    var deleteLongRowWrapper = $('<div>', {
                        'class': 'deleteLongRowWrapper',
                    })
                    
                    // rowWrapper
                    var rowWrapper_valid = $('<div>', {
                        'class': 'rowWrapper',
                    })

                    var rowWrapper_invalid = $('<div>', {
                        'class': 'rowWrapper',
                    })

                    var rowWrapper_all = $('<div>', {
                        'class': 'rowWrapper',
                    })

                    // dropdown_list
                    var dropdown_list_student = $('<div>', {
                        'class': 'rowWrapper dropdown-list'
                    })

                    var dropdown_list_period = $('<div>', {
                        'class': 'rowWrapper dropdown-list'
                    })

                    var dropdown_list_date = $('<div>', {
                        'class': 'rowWrapper dropdown-list dropdown-list--date'
                    })


                    // dropdown_menu
                    var dropdown_menu_student = $('<ul>', {
                        'class': 'dropdown-menu'
                    })

                    var dropdown_menu_period = $('<ul>', {
                        'class': 'dropdown-menu'
                    })

                    var dropdown_menu_date = $('<ul>', {
                        'class': 'dropdown-menu dropdown-menu--date'
                    })

                    dropdown_menu_student.append($('<li>', {
                        'class': 'dropdownElement dropdownFirstElement'
                    }))

                    dropdown_menu_period.append($('<li>', {
                        'class': 'dropdownElement dropdownFirstElement'
                    }))

                    dropdown_menu_date.append($('<li>', {
                        'class': 'dropdownElement dropdownFirstElement'
                    }))


                    all_periods.forEach((period) => {
                        var dropdownElement = $('<li>', {
                            'class': 'dropdownElement',
                            'data-id': `period_${period.pk}`
                        }).text(period.fields.period)

                        dropdown_menu_period.append(dropdownElement)
                    })


                    all_students.forEach((student) => {
                        var dropdownElement = $('<li>', {
                            'class': 'dropdownElement',
                            'data-id': `student_${student.student.id}`
                        }).text(student.student.fullname)

                        dropdown_menu_student.append(dropdownElement)
                    })

                    dates.forEach((date) => {
                        var dropdownElement = $('<li>', {
                            'class': 'dropdownElement',
                            'data-id': `date`
                        }).text(date)

                        dropdown_menu_date.append(dropdownElement)
                    })


                    // Row input
                    var rowInput_student = $('<input>', {
                        'type': 'text',
                        'class': 'rowInput',
                        'data-id': `student_${el.rerender.student.id}`,
                        'value': el.rerender.student.fullname,
                        'readonly': true,
                    })

                    var rowInput_period = $('<input>', {
                        'type': 'text',
                        'class': 'rowInput',
                        'value': el.period,
                        'data-id': `period_${el.rerender.period.id}`,
                        'readonly': true,
                    })

                    var rowInput_date = $('<input>', {
                        'type': 'text',
                        'class': 'rowInput',
                        'value': el.date,
                        'readonly': true,
                    })

                    var rowInput_valid = $('<input>', {
                        'type': 'number',
                        'class': 'rowInput',
                        'data-id': 'valid',
                        'value': el.valid_skipping
                    })

                    var rowInput_invalid = $('<input>', {
                        'type': 'number',
                        'class': 'rowInput',
                        'data-id': 'invalid',
                        'value': el.invalid_skipping
                    })

                    var rowInput_all = $('<input>', {
                        'type': 'number',
                        'class': 'rowInput',
                        'data-id': 'all',
                        'readonly': true,
                        'value': el.all_skipping
                    })

                    dropdown_list_student.append(rowInput_student, dropdown_menu_student)
                    dropdown_list_period.append(rowInput_period, dropdown_menu_period)
                    dropdown_list_date.append(rowInput_date, dropdown_menu_date)
                    rowWrapper_valid.append(rowInput_valid)
                    rowWrapper_invalid.append(rowInput_invalid)
                    rowWrapper_all.append(rowInput_all)

                    var deleteIcon = $('<img>', {
                        'class': 'deleteRow',
                        'src': staticUrl + 'img/delete.svg',
                    })

                    deleteLongRowWrapper.append(dropdown_list_student, dropdown_list_period, dropdown_list_date, rowWrapper_valid, rowWrapper_invalid, rowWrapper_all)
                    longRowWrapper.append(deleteLongRowWrapper, deleteIcon)
                    rowsWrapper.append(longRowWrapper)
                    })
                })

                rowsWrapper.insertBefore($('.btnsWrapper'))
        })
        })
        .catch((error) => {
            console.error(error)
        })

    .catch((error) => {
        console.error(error)
    })
}


// Уникальные месяцы в списке
function getUniquePeriods(data) {
    const uniquePeriods = [];
    const periods = new Set();

    data.forEach(item => {
        if (!periods.has(item.fields.period)) {
            periods.add(item.fields.period);
            uniquePeriods.push(item);
        }
    });

    return uniquePeriods
}


// Фильтрация по месяцам
$(document).on('click', '.dropdownElement--periodFilter', function(e) {
    $('.adminTables').remove()
    
    const period_name = $(this).closest('.dropdown-list--filter').find('.rowInput').val()
    if (period_name != 'Все периоды') {
        render_periods(period_name)
        return
    }

    render_periods()
})