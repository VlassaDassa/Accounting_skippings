from django.shortcuts import render

from django.http import JsonResponse
from django.core.serializers import serialize
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.contrib.auth import authenticate

from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from django.core.serializers import serialize
from reportlab.platypus import Paragraph
from reportlab.platypus import Spacer
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table
from reportlab.platypus.flowables import Flowable
from tempfile import NamedTemporaryFile
from django.http import HttpResponse
import os

from .models import Group, Student, Period, Skipping, Manager
from . import services


# Отрисовка страницы "Главная"
def index(request):
    return render(request, 'index.html')


# Отрисовка страницы "Администратор"
def admin_page(request):
    return render(request, 'admin.html')


# Отрисовка страницы "Староста"
def manager_panel(request):
    return render(request, 'manager.html')


# Авторизация
@csrf_exempt
def login_view(request):
    login = request.POST.get('login')
    password = request.POST.get('password')
    
    user = authenticate(username=login, password=password)
    if user:
        return JsonResponse({'success': True, 'admin': True})

    custom_user = Manager.objects.filter(login=login, password=password).first()
    if custom_user:
        return JsonResponse({'success': True, 'admin': False, 'login': custom_user.login})
    
    return JsonResponse({'success': False})



# Получение данных для таблицы "Группы"
def get_groups(request):
    data = serialize('json', Group.objects.all())
    return JsonResponse({'groups': data})


# Удаление группы
def remove_group(request, id):
    group = Group.objects.get(id=id)
    group.delete()
    return JsonResponse({'success': True})

# Добавление группы
@csrf_exempt
def add_group(request):
    group_name = request.POST.get('group_name')
    new_group = Group(group_name=group_name.upper())
    new_group.save()
    return JsonResponse({'success': True, 'new_elem_id': new_group.pk})

# Обновление группы
@csrf_exempt
def update_group(request):
    group_id = request.POST.get('id')
    new_value = request.POST.get('new_value')
    group = Group.objects.get(id=group_id)
    group.group_name = new_value.upper()
    group.save()

    return JsonResponse({'success': True})






# Получение данных для таблицы "Студенты"
def get_students(request):
    students = Student.objects.all()
    students_data = []
    for student in students:
        student_data = {
            'student': {
                'fullname': student.fullname,
                'id': student.id,
            },
            'group': {
                'group_name':  student.group.group_name,
                'id':  student.group.id,

            }
        }
        students_data.append(student_data)

    return JsonResponse({'students': students_data})


# Получение данных для таблицы "Студенты" по группе
def get_students_for_group(request, group_id):
    students = Student.objects.filter(group_id=group_id)
    students_data = []
    for student in students:
        student_data = {
            'student': {
                'fullname': student.fullname,
                'id': student.id,
            },
            'group': {
                'group_name':  student.group.group_name,
                'id':  student.group.id,
            }
        }
        students_data.append(student_data)

    return JsonResponse({'students': students_data})


# Удаление студента
def remove_student(request, id):
    student = Student.objects.get(id=id)
    student.delete()
    return JsonResponse({'success': True})

# Добавление студента
@csrf_exempt
def add_student(request):
    fullname = request.POST.get('fullname')
    group_id = request.POST.get('group_id')
    group = Group.objects.get(id=group_id)
    new_student = Student(fullname=fullname, group=group)
    new_student.save()
    return JsonResponse({'success': True, 'new_elem_id': new_student.pk})

# Обновление студента
@csrf_exempt
def update_student(request):
    student_id = request.POST.get('student_id')
    fullname = request.POST.get('fullname')
    group_id = request.POST.get('group_id')
    group = Group.objects.get(id=group_id)
    
    student = Student.objects.get(id=student_id)
    student.fullname = fullname
    student.group = group
    student.save()

    return JsonResponse({'success': True})







# Получение данных для таблицы "Периоды"
def get_periods(request):
    data = serialize('json', Period.objects.all())
    return JsonResponse({'periods': data})

# Удаление периода
def remove_period(request, id):
    period = Period.objects.get(id=id)
    period.delete()
    return JsonResponse({'success': True})

# Добавление периода
@csrf_exempt
def add_period(request):
    period_name = request.POST.get('period')
    date = request.POST.get('date')
    period = Period(period=period_name, date=date)
    period.save()
    return JsonResponse({'success': True, 'new_elem_id': period.pk})

# Обновление периода
@csrf_exempt
def update_period(request):
    period_id = request.POST.get('id')
    new_value = request.POST.get('new_value')
    date = request.POST.get('date')
    period = Period.objects.get(id=period_id)
    period.period = new_value
    period.date = date
    period.save()

    return JsonResponse({'success': True})


# Получение всех дат по период 
def get_all_date_for_period(request, period):
    dates = [i.date for i in Period.objects.filter(period=period)]
    return JsonResponse({'dates': dates})

# Получение всех периодов по имени
def get_all_period_by_name(request, period_name):
    periods = Period.objects.filter(period=period_name)
    periods_json = serialize('json', periods)
    return JsonResponse({'periods': periods_json}, safe=False)









# Получение данных для таблицы "Староста"
def get_managers(request):
    managers = Manager.objects.all()
    managers_data = []
    for manager in managers:
        manager_data = {
            'manager_id': manager.id,
            'login': manager.login,
            'password': manager.password,
            'student': {
                'fullname': manager.student.fullname,
                'id': manager.student.id,
            },
            'group': {
                'group_name':  manager.group.group_name,
                'id':  manager.group.id,

            }
        }
        managers_data.append(manager_data)

    return JsonResponse({'managers': managers_data})

# Удаление менеджера
def remove_manager(request, id):
    manager = Manager.objects.get(id=id)
    manager.delete()
    return JsonResponse({'success': True})

# Добавление менеджера
@csrf_exempt
def add_manager(request):
    student_id = request.POST.get('student_id')
    group_id = request.POST.get('group_id')
    login = request.POST.get('login')
    password = request.POST.get('password')

    manager = Manager(
        student=Student.objects.get(id=student_id),
        group=Group.objects.get(id=group_id),
        login=login,
        password=password
    )
    manager.save()
    return JsonResponse({'success': True, 'new_elem_id': manager.pk})

# Обновление менеджера
@csrf_exempt
def update_manager(request):
    manager_id = request.POST.get('manager_id')
    student_id = request.POST.get('student_id')
    group_id = request.POST.get('group_id')
    login = request.POST.get('login')
    password = request.POST.get('password')

    manager = Manager.objects.get(id=manager_id)
    manager.student = Student.objects.get(id=student_id)
    manager.group = Group.objects.get(id=group_id)
    manager.login = login
    manager.password = password
    manager.save()

    return JsonResponse({'success': True})







# Получение данных для таблицы "Пропуски"
def get_skippings(request):
    skippings = Skipping.objects.all()
    skippings_data = []
    for skipping in skippings:
        skipping_data = {
            'skipping_id': skipping.id,
            'period': {
                'period': skipping.period.period,
                'id': skipping.period.id,
            },
            'student': {
                'fullname': skipping.student.fullname,
                'id': skipping.student.id,
            },
            'valid_skipping': skipping.valid_skipping,
            'invalid_skipping': skipping.invalid_skipping,
            'all_skipping': skipping.all_skipping,
            'date': skipping.date,
        }
        skippings_data.append(skipping_data)

    return JsonResponse({'skippings': skippings_data})

# Удаление записи о пропусках
def remove_skipping(request, id):
    skipping = Skipping.objects.get(id=id)
    skipping.delete()
    return JsonResponse({'success': True})

# Добавление записи о пропусках
@csrf_exempt
def add_skipping(request):
    student_id = request.POST.get('student_id')
    period_id = request.POST.get('period_id')
    valid_skipping = request.POST.get('valid_skipping')
    invalid_skipping = request.POST.get('invalid_skipping')
    all_skipping = request.POST.get('all_skipping')
    date = request.POST.get('date')

    skipping = Skipping(
        student=Student.objects.get(id=student_id),
        period=Period.objects.get(id=period_id),
        valid_skipping = int(valid_skipping) if valid_skipping.strip() else 0,
        invalid_skipping = int(invalid_skipping) if invalid_skipping.strip() else 0,
        all_skipping = int(all_skipping) if all_skipping.strip() else 0,
        date=date
    )
    skipping.save()
    return JsonResponse({'success': True, 'new_elem_id': skipping.pk})

# Обновление записи о пропусках
@csrf_exempt
def update_skipping(request):
    skipping_id = request.POST.get('skipping_id')
    student_id = request.POST.get('student_id')
    period_id = request.POST.get('period_id')
    valid_skipping = request.POST.get('valid_skipping')
    invalid_skipping = request.POST.get('invalid_skipping')
    all_skipping = request.POST.get('all_skipping')
    date = request.POST.get('date')


    skipping = Skipping.objects.get(id=skipping_id)
    skipping.student = Student.objects.get(id=student_id)
    skipping.period = Period.objects.get(id=period_id)
    skipping.valid_skipping = int(valid_skipping) if valid_skipping.strip() else 0
    skipping.invalid_skipping = int(invalid_skipping) if invalid_skipping.strip() else 0
    skipping.all_skipping = int(all_skipping) if all_skipping.strip() else 0
    skipping.date = date
    skipping.save()

    return JsonResponse({'success': True})



# Форматирование данных отчёта
def format_report_data(group_name, period, date):
    terms = {
        'first_term': [
            'Сентябрь',
            'Октябрь',
            'Ноябрь',
            'Декабрь'
        ],

        'second_term': [
            'Январь',
            'Февраль',
            'Март',
            'Апрель',
            'Май',
            'Июнь'
        ],        
    }

    terms['year'] = terms['first_term'] + terms['second_term']
    periods = terms.get(period, [])

    if group_name != 'all' and period not in terms.keys() and date == "Не выбрано":
        group = Group.objects.get(group_name=group_name.upper())
        skippings = Skipping.objects.filter(period__period=period, student__group=group)

    elif group_name == 'all' and period not in terms.keys() and date == "Не выбрано":
        skippings = Skipping.objects.filter(period__period=period)

    elif group_name != 'all' and date != "Не выбрано":
        group = Group.objects.get(group_name=group_name.upper())
        skippings = Skipping.objects.filter(date=date, student__group=group)

    elif group_name != 'all' and date == "Не выбрано":
        group = Group.objects.get(group_name=group_name.upper())
        skippings = Skipping.objects.filter(period__period__in=periods, student__group=group)

    elif group_name == 'all' and date != 'Не выбрано':
        skippings = Skipping.objects.filter(date=date)

    elif group_name == 'all' and date == 'Не выбрано':
        skippings = Skipping.objects.filter(period__period__in=periods)
       

    send_data = []
    for skipping in skippings:
        send_data.append({
            'student': skipping.student.fullname,
            'period': skipping.period.period,
            'valid_skipping': skipping.valid_skipping,
            'invalid_skipping': skipping.invalid_skipping,
            'all_skipping': skipping.all_skipping,
            'date': skipping.date,

            'rerender': {
                'period': {
                    'period': skipping.period.period,
                    'id': skipping.period.pk
                },

                'student': {
                    'fullname': skipping.student.fullname,
                    'id': skipping.student.pk
                },
                'skipping_id': skipping.pk,
            }
        })

    group_data = services.group_skippings(send_data)
    
    return group_data

# Получение данных для отчёта:
def get_report(request, group_name, period, date):
    try:
        send_data = format_report_data(group_name, period, date)
    except Exception as _ex:
        return JsonResponse({'success': False})

    return JsonResponse({'success': True, 'skippings': send_data})


# Для вертикального текста в заголовке
class verticalText(Flowable):
    def __init__(self, text):
        Flowable.__init__(self)
        self.text = text

    def draw(self):
        canvas = self.canv
        canvas.rotate(90)
        fs = canvas._fontsize
        canvas.translate(1, -fs/1.2) 
        canvas.drawString(0, 0, self.text)

    def wrap(self, aW, aH):
        canv = self.canv
        fn, fs = canv._fontname, canv._fontsize
        return canv._leading, 1 + canv.stringWidth(self.text, fn, fs)



# Генерация и отправка отчёта
def generate_report(request, group_name, date, period, student_name):
    data = services.clean_date(format_report_data(group_name, period, date))
    if student_name != 'no':
        data = [i for i in services.clean_date(format_report_data(group_name, period, date)) if i.get('student') == student_name]
    

    total_invalid_skipping = sum(item['invalid_skipping'] for item in data)
    total_all_skipping = sum(item['all_skipping'] for item in data)

    pdf_temp_file = NamedTemporaryFile(suffix='.pdf', delete=False)
    doc = SimpleDocTemplate(pdf_temp_file.name, pagesize=letter)

    font_path= os.path.join(os.path.dirname(__file__), "fonts", "arial.ttf")
    font_bold_path = os.path.join(os.path.dirname(__file__), "fonts", "arial_bold.ttf")
    pdfmetrics.registerFont(TTFont('CustomFont', font_path))
    pdfmetrics.registerFont(TTFont('CustomFontBold', font_bold_path))

    headers = ['№ п/п', 'ФИО', 'Период', 'Уваж.', 'Неуваж', 'Всего']

    title_text = "Сводная ведомость посещаемости студентов КЭК"

    # Заголовок табилцы
    period_dict = {
        'year': 'весь учебный год',
        'first_term': '1-й семестр',
        'second_term': '2-й семестр',
    }

    if date == 'Не выбрано':
        if period not in period_dict:
            if (group_name != 'all'):
                subtitle_text = f"гр. {group_name} за {period.lower()}"
            else:
                subtitle_text = f"по всем группам за {period.lower()}"
        else:
            if (group_name != 'all'):
                subtitle_text = f"гр. {group_name} за {period_dict[period]}"
            else:
                subtitle_text = f"по всем группам за {period_dict[period]}"
    else:
        if (group_name != 'all'):
            subtitle_text = f"гр. {group_name} за {date}"
        else:
            subtitle_text = f"по всем группам за {date}"

    title_style = ParagraphStyle('CustomParagraphStyle', fontName='CustomFontBold', fontSize=12, textColor=colors.black, alignment=1, spaceAfter=10)
    subtitle_style = ParagraphStyle('CustomParagraphStyle', fontName='CustomFontBold', fontSize=12, textColor=colors.black, alignment=1, spaceAfter=20)
    title = Paragraph(title_text, title_style)
    subtitle = Paragraph(subtitle_text, subtitle_style)
    
    data = [{key: value for key, value in row.items() if key != 'rerender'} for row in data]
    rows = [
    [index + 1] + [
        Paragraph(str(value), ParagraphStyle('CustomParagraphStyle', fontName='CustomFont', textColor=colors.black, alignment=1))
        if isinstance(value, str) and key != 'rerender' else value
        for key, value in row.items()
    ]
    for index, row in enumerate(data)
]


    style = [('BACKGROUND', (0, 0), (-1, 0), colors.white),
             ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
             ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
             ('FONTNAME', (0, 0), (-1, 0), 'CustomFontBold'), 
             ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
             ('GRID', (0, 0), (-1, -1), 1, colors.black)]

    table = Table([headers] + rows)
    table.setStyle(TableStyle(style))

    elements = [title, subtitle, Spacer(1, 20), table]

    total_hours_text = f"Пропущено всего часов: {total_all_skipping}"
    disrespectful_hours_text = f"Пропущено по неуважительной причине: {total_invalid_skipping}"
    total_hours = Paragraph(total_hours_text, ParagraphStyle('CustomParagraphStyle', fontName='CustomFont', textColor=colors.black, alignment=2, leftIndent=150))
    disrespectful_hours = Paragraph(disrespectful_hours_text, ParagraphStyle('CustomParagraphStyle', fontName='CustomFont', textColor=colors.black, alignment=2, leftIndent=150))
    elements.extend([Spacer(1, 10), total_hours, disrespectful_hours])

    doc.build(elements)

    with open(pdf_temp_file.name, 'rb') as pdf_file:
        pdf_content = pdf_file.read()

    pdf_temp_file.close()
    os.unlink(pdf_temp_file.name)

    response = HttpResponse(pdf_content, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename=report.pdf'

    return response


# Получение всех дат
def get_all_dates(request):
    all_dates = Skipping.objects.values_list('date', flat=True)
    unique_dates = set(all_dates)
    unique_dates_list = list(unique_dates)
    return JsonResponse({'dates': unique_dates_list})

