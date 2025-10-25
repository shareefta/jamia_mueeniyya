# transactions/migrations/0005_update_transaction_fields.py
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('transactions', '0004_remove_openingbalance_campus_and_more'),  # last applied migration
    ]

    operations = [
        # Add party field
        migrations.AddField(
            model_name='transaction',
            name='party',
            field=models.CharField(max_length=100, default='Unknown'),  # default only for existing rows
        ),
        # Add mobile_number field
        migrations.AddField(
            model_name='transaction',
            name='mobile_number',
            field=models.CharField(max_length=15, default='0000000000'),  # default for existing rows
        ),
        # Alter remarks field
        migrations.AlterField(
            model_name='transaction',
            name='remarks',
            field=models.TextField(blank=False, null=False, default='-'),  # default for existing rows
        ),
    ]
