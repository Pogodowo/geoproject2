from allauth.account.forms import LoginForm as AllAuthLoginForm
from django import forms


class MyLoginForm(AllAuthLoginForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove fields not needed
        del self.fields['remember']
        #del self.fields['signup']

        # Update widget properties to remove labels
        self.fields['login'].widget.attrs.update({'placeholder': 'Username', 'class': 'your-class'})
        self.fields['password'].widget = forms.PasswordInput(attrs={'placeholder': 'Password', 'class': 'your-class'})
