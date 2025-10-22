from django import forms

class ExcelUploadForm(forms.Form):
    file = forms.FileField(label="Select Excel File (.xlsx)", required=False)
    confirm = forms.BooleanField(required=False, widget=forms.HiddenInput())
