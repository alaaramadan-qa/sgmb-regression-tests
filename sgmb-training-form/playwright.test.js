// @ts-check
const { test, expect } = require('@playwright/test');

const DATA = {
    firstNameAr: 'محمد', middleNameAr: 'أحمد', lastNameAr: 'الزهراني',
    firstNameEn: 'Mohammed', middleNameEn: 'Ahmed', lastNameEn: 'Al Zahrani',
    university: 'جامعة الشارقة', major: 'الاتصال الجماهيري',
    emirate: 'الشارقة', city: 'مدينة الشارقة',
    phone: '501234567', email: 'alaa.ramadan+trainee@alweb.com',
    startDate: '10/03/2026', endDate: '10/06/2026',
    supervisorPhone: '509876543', supervisorName: 'أحمد سالم المنصوري',
    supervisorEmail: 'alaa.ramadan+supervisor@alweb.com',
    score: '85',
    note: 'أدى المتدرب عمله بشكل ممتاز وأظهر مهارات تواصل عالية واحترافية خلال فترة التدريب الميداني.',
};

const FORM_URL = 'https://sgmb.stg.alweb4tech.com/ar/forms/training-registration';
const ADMIN_URL = 'https://admin.stg.alweb4tech.com/TrainingRegistrationForm';

async function uploadTestFiles(page) {
    await page.evaluate(() => {
          const png = atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==');
          const arr = new Uint8Array(png.length);
          for (let i = 0; i < png.length; i++) arr[i] = png.charCodeAt(i);
          const pdf = '%PDF-1.4 1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj trailer<</Size 2/Root 1 0 R>> startxref 0 %%EOF';
          function setFile(input, file) {
                  const dt = new DataTransfer(); dt.items.add(file);
                  input.files = dt.files;
                  input.dispatchEvent(new Event('change', {bubbles:true}));
          }
          const inputs = document.querySelectorAll('input[type="file"]');
          setFile(inputs[0], new File([pdf], 'test_letter.pdf', {type:'application/pdf'}));
          setFile(inputs[1], new File([arr], 'test_id.png', {type:'image/png'}));
          setFile(inputs[2], new File([arr], 'test_photo.png', {type:'image/png'}));
    });
}

test('SGMB Training Form - Full Regression', async ({ page }) => {

       // STEP 1: Personal Data
       await page.goto(FORM_URL);
    await page.getByPlaceholder('أدخل الاسم الأول باللغة العربية').fill(DATA.firstNameAr);
    await page.getByPlaceholder('أدخل الاسم الأوسط باللغة العربية').fill(DATA.middleNameAr);
    await page.getByPlaceholder('أدخل اسم العائلة باللغة العربية').fill(DATA.lastNameAr);
    await page.getByPlaceholder('أدخل الاسم الأول باللغة الإنجليزية').fill(DATA.firstNameEn);
    await page.getByPlaceholder('أدخل الاسم الأوسط باللغة الإنجليزية').fill(DATA.middleNameEn);
    await page.getByPlaceholder('أدخل اسم العائلة باللغة الإنجليزية').fill(DATA.lastNameEn);
    await page.getByPlaceholder('أرجو إدخال اسم جامعتك.').click();
    await page.getByPlaceholder('أرجو إدخال اسم جامعتك.').fill('جامعة');
    await page.getByRole('option', { name: DATA.university }).click();
    await page.getByPlaceholder('يرجى اختيار تخصصك الجامعي.').click();
    await page.getByRole('option', { name: DATA.major }).click();
    await page.getByRole('combobox', { name: 'الإمارة' }).click();
    await page.getByRole('option', { name: DATA.emirate }).click();
    await page.getByRole('combobox', { name: 'المدينة' }).click();
    await page.getByRole('option', { name: DATA.city }).click();
    await page.getByPlaceholder('رقم الجوال').fill(DATA.phone);
    await page.getByPlaceholder('أرجو إدخال بريدك الإلكتروني.').fill(DATA.email);
    await page.getByRole('button', { name: 'التالي' }).click();
    await expect(page.getByText('معلومات التدريب')).toBeVisible();

       // STEP 2: Training Info
       await page.getByPlaceholder('من').click();
    await page.getByRole('button', { name: '10' }).first().click();
    await page.getByPlaceholder('إلى').click();
    for (let i = 0; i < 3; i++) await page.locator('button[aria-label="next"]').click();
    await page.getByRole('button', { name: '10' }).first().click();
    await page.getByPlaceholder('أرجو إدخال رقم الهاتف الجوال للمشرف الخاص بك.').fill(DATA.supervisorPhone);
    await page.getByPlaceholder('أرجو إدخال اسم المشرف .').fill(DATA.supervisorName);
    await page.getByPlaceholder('أرجو إدخال البريد الإلكتروني للمشرف الخاص بك.').fill(DATA.supervisorEmail);
    await page.getByRole('button', { name: 'التالي' }).click();
    await expect(page.getByText('المرفقات')).toBeVisible();

       // STEP 3: Upload Attachments & Submit
       await uploadTestFiles(page);
    await expect(page.getByText('test_photo.png')).toBeVisible();
    await page.getByRole('button', { name: 'إرسال' }).click();
    await page.getByRole('button', { name: 'إرسال' }).last().click();
    await expect(page.getByText('تم استلام طلبكم بنجاح')).toBeVisible();

       // STEP 4: Admin Verify & Approve
       await page.goto(ADMIN_URL);
    await page.locator('table tbody tr').first().click();
    await expect(page.getByText(DATA.firstNameAr)).toBeVisible();
    await expect(page.getByText(DATA.university)).toBeVisible();
    await expect(page.getByText('2026-03-10')).toBeVisible();
    await expect(page.getByText('2026-06-10')).toBeVisible();
    await page.getByRole('button', { name: 'موافقة' }).click();
    await page.getByRole('button', { name: 'إرسال' }).click();
    await expect(page.getByText('تمت العملية بنجاح')).toBeVisible();

       // STEP 5: Send Certificate
       await page.locator('input[type="number"]').fill(DATA.score);
    await page.getByPlaceholder('أضف ملاحظاتك').fill(DATA.note);
    await page.evaluate(() => {
          const pdf = '%PDF-1.4 1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj trailer<</Size 2/Root 1 0 R>> startxref 0 %%EOF';
          const file = new File([pdf], 'certificate_attachment.pdf', {type:'application/pdf'});
          const inputs = document.querySelectorAll('input[type="file"]');
          const dt = new DataTransfer(); dt.items.add(file);
          inputs[inputs.length-1].files = dt.files;
          inputs[inputs.length-1].dispatchEvent(new Event('change', {bubbles:true}));
    });
    await page.getByRole('button', { name: 'إرسال الشهادة' }).click();
    await page.getByRole('button', { name: 'نعم' }).click();
    await expect(page.getByText('رابط الملف')).toBeVisible();

       // STEP 6: Verify Email
       await page.goto('https://mail.google.com/mail/u/0/#inbox');
    await page.waitForLoadState('networkidle');
    await page.getByText('Certificate of Completion').first().click();
    await expect(page.getByText('Mohammed Al Zahrani')).toBeVisible();
    await expect(page.getByText('85.00')).toBeVisible();
    await expect(page.getByText('SGMB_Training_C')).toBeVisible();
});
