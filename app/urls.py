from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='main'),

    # Староста и администратор
    path('administrator', views.admin_page, name='admin_page'),
    path('manager_panel', views.manager_panel, name='manager_panel'),
    
    # Авторизация
    path('login', views.login_view, name='login_view'),

    # Группы
    path('get_groups', views.get_groups, name='get_groups'),
    path('remove_group/<id>', views.remove_group, name='remove_group'),
    path('add_group', views.add_group, name='add_group'),
    path('update_group', views.update_group, name='update_group'),

    # Студенты
    path('get_students', views.get_students, name='get_students'),
    path('get_students_for_group/<group_id>', views.get_students_for_group, name='get_students_for_group'),
    path('remove_student/<id>', views.remove_student, name='remove_student'),
    path('add_student', views.add_student, name='add_student'),
    path('update_student', views.update_student, name='update_student'),

    # Периоды
    path('get_periods', views.get_periods, name='get_periods'),
    path('remove_period/<id>', views.remove_period, name='remove_period'),
    path('add_period', views.add_period, name='add_period'),
    path('update_period', views.update_period, name='update_period'),
    path('get_all_date_for_period/<period>', views.get_all_date_for_period, name='get_all_date_for_period'),
    path('get_all_period_by_name/<period_name>', views.get_all_period_by_name, name='get_all_period_by_name'),

    # Старосты
    path('get_managers', views.get_managers, name='get_managers'),
    path('remove_manager/<id>', views.remove_manager, name='remove_manager'),
    path('add_manager', views.add_manager, name='add_manager'),
    path('update_manager', views.update_manager, name='update_manager'),

    # Пропуски
    path('get_skippings', views.get_skippings, name='get_skippings'),
    path('remove_skipping/<id>', views.remove_skipping, name='remove_skipping'),
    path('add_skipping', views.add_skipping, name='add_skipping'),
    path('update_skipping', views.update_skipping, name='update_skipping'),

    # Отчёт
    path('get_report/<group_name>/<period>/<date>', views.get_report, name='get_report'),
    path('generate_report/<group_name>/<period>/<date>/<student_name>', views.generate_report, name='generate_report'),

    # Получение всех данных
    path('get_all_dates', views.get_all_dates, name='get_all_dates'),

]