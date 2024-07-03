from django.db import models
from django.utils import timezone


# Группа
class Group(models.Model):
    group_name = models.CharField(max_length=30)

    def __str__(self):
        return str(self.group_name)


# Студент
class Student(models.Model):
    fullname = models.CharField(max_length=50)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.fullname) + ' | ' + str(self.group.group_name)


# Период (месяц, семестр, год и т.п)
class Period(models.Model):
    period = models.CharField(max_length=50)
    date = models.CharField(max_length=30, null=True, blank=True)

    def __str__(self):
        return str(self.period) + ' | ' + str(self.date)


# Пропуски
class Skipping(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    period = models.ForeignKey(Period, on_delete=models.CASCADE)
    date = models.CharField(max_length=30)
    valid_skipping = models.IntegerField()
    invalid_skipping = models.IntegerField()
    all_skipping = models.IntegerField()

    def __str__(self):
        return str(self.student.fullname) + ' | ' + str(self.period.period)
    

# Староста
class Manager(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    login = models.CharField(max_length=30)
    password = models.CharField(max_length=50)

    def __str__(self):
        return str(self.student.fullname) + ' | ' + str(self.group.group_name)


