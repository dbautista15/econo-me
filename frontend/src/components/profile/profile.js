document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const personalInfoTab = document.getElementById('personalInfoTab');
    const securityTab = document.getElementById('securityTab');
    const preferencesTab = document.getElementById('preferencesTab');
    
    const personalInfoSection = document.getElementById('personalInfoSection');
    const securitySection = document.getElementById('securitySection');
    const preferencesSection = document.getElementById('preferencesSection');
    
    const editPersonalInfoBtn = document.getElementById('editPersonalInfoBtn');
    const personalInfoForm = document.getElementById('personalInfoForm');
    const personalInfoActions = document.getElementById('personalInfoActions');
    const cancelPersonalInfoBtn = document.getElementById('cancelPersonalInfoBtn');
    
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const passwordFormContainer = document.getElementById('passwordFormContainer');
    const securityInfo = document.getElementById('securityInfo');
    const passwordForm = document.getElementById('passwordForm');
    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    
    const editPreferencesBtn = document.getElementById('editPreferencesBtn');
    const preferencesForm = document.getElementById('preferencesForm');
    const preferencesActions = document.getElementById('preferencesActions');
    const cancelPreferencesBtn = document.getElementById('cancelPreferencesBtn');
    
    const notificationToast = document.getElementById('notificationToast');
    const notificationMessage = document.getElementById('notificationMessage');
    
    // Tab Navigation
    function showSection(section) {
        // Hide all sections
        personalInfoSection.classList.add('hidden');
        securitySection.classList.add('hidden');
        preferencesSection.classList.add('hidden');
        
        // Reset tab styles
        personalInfoTab.classList.remove('bg-primary-color', 'text-white');
        personalInfoTab.classList.add('hover:bg-secondary-color');
        securityTab.classList.remove('bg-primary-color', 'text-white');
        securityTab.classList.add('hover:bg-secondary-color');
        preferencesTab.classList.remove('bg-primary-color', 'text-white');
        preferencesTab.classList.add('hover:bg-secondary-color');
        
        // Show selected section and update tab style
        section.classList.remove('hidden');
        
        if (section === personalInfoSection) {
            personalInfoTab.classList.add('bg-primary-color', 'text-white');
            personalInfoTab.classList.remove('hover:bg-secondary-color');
        } else if (section === securitySection) {
            securityTab.classList.add('bg-primary-color', 'text-white');
            securityTab.classList.remove('hover:bg-secondary-color');
        } else if (section === preferencesSection) {
            preferencesTab.classList.add('bg-primary-color', 'text-white');
            preferencesTab.classList.remove('hover:bg-secondary-color');
        }
    }
    
    personalInfoTab.addEventListener('click', () => showSection(personalInfoSection));
    securityTab.addEventListener('click', () => showSection(securitySection));
    preferencesTab.addEventListener('click', () => showSection(preferencesSection));
    
    // Personal Information CRUD
    editPersonalInfoBtn.addEventListener('click', function() {
        // Enable form fields
        const inputs = personalInfoForm.querySelectorAll('input, textarea');
        inputs.forEach(input => input.disabled = false);
        
        // Show action buttons
        personalInfoActions.classList.remove('hidden');
        
        // Hide edit button
        editPersonalInfoBtn.classList.add('hidden');
    });
    
    cancelPersonalInfoBtn.addEventListener('click', function() {
        // Disable form fields
        const inputs = personalInfoForm.querySelectorAll('input, textarea');
        inputs.forEach(input => input.disabled = true);
        
        // Reset form to original values (in a real app, you might fetch from server)
        personalInfoForm.reset();
        
        // Hide action buttons
        personalInfoActions.classList.add('hidden');
        
        // Show edit button
        editPersonalInfoBtn.classList.remove('hidden');
    });
    
    personalInfoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // In a real app, you would send this data to your backend
        const formData = new FormData(personalInfoForm);
        const userData = Object.fromEntries(formData.entries());
        
        // Update displayed name and email
        document.getElementById('profileName').textContent = `${userData.firstName} ${userData.lastName}`;
        document.getElementById('profileEmail').textContent = userData.email;
        
        // Disable form fields
        const inputs = personalInfoForm.querySelectorAll('input, textarea');
        inputs.forEach(input => input.disabled = true);
        
        // Hide action buttons
        personalInfoActions.classList.add('hidden');
        
        // Show edit button
        editPersonalInfoBtn.classList.remove('hidden');
        
        // Show success notification
        showNotification('Personal information updated successfully!');
    });
    
    // Password Change
    changePasswordBtn.addEventListener('click', function() {
        securityInfo.classList.add('hidden');
        passwordFormContainer.classList.remove('hidden');
        changePasswordBtn.classList.add('hidden');
    });
    
    cancelPasswordBtn.addEventListener('click', function() {
        securityInfo.classList.remove('hidden');
        passwordFormContainer.classList.add('hidden');
        changePasswordBtn.classList.remove('hidden');
        passwordForm.reset();
    });
    
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Basic validation
        if (newPassword !== confirmPassword) {
            showNotification('New passwords do not match!', 'error');
            return;
        }
        
        if (newPassword.length < 8) {
            showNotification('Password must be at least 8 characters long!', 'error');
            return;
        }
        
        // In a real app, you would send this to your backend
        console.log('Password change requested', { currentPassword, newPassword });
        
        // Reset form
        passwordForm.reset();
        securityInfo.classList.remove('hidden');
        passwordFormContainer.classList.add('hidden');
        changePasswordBtn.classList.remove('hidden');
        
        showNotification('Password updated successfully!');
    });
    
    // Preferences CRUD
    editPreferencesBtn.addEventListener('click', function() {
        // Enable form fields
        const inputs = preferencesForm.querySelectorAll('input, select');
        inputs.forEach(input => input.disabled = false);
        
        // Show action buttons
        preferencesActions.classList.remove('hidden');
        
        // Hide edit button
        editPreferencesBtn.classList.add('hidden');
    });
    
    cancelPreferencesBtn.addEventListener('click', function() {
        // Disable form fields
        const inputs = preferencesForm.querySelectorAll('input, select');
        inputs.forEach(input => input.disabled = true);
        
        // Reset form to original values (in a real app, you might fetch from server)
        preferencesForm.reset();
        
        // Hide action buttons
        preferencesActions.classList.add('hidden');
        
        // Show edit button
        editPreferencesBtn.classList.remove('hidden');
    });
    
    preferencesForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // In a real app, you would send this data to your backend
        const formData = new FormData(preferencesForm);
        const preferences = Object.fromEntries(formData.entries());
        console.log('Preferences updated', preferences);
        
        // Disable form fields
        const inputs = preferencesForm.querySelectorAll('input, select');
        inputs.forEach(input => input.disabled = true);
        
        // Hide action buttons
        preferencesActions.classList.add('hidden');
        
        // Show edit button
        editPreferencesBtn.classList.remove('hidden');
        
        // Show success notification
        showNotification('Preferences updated successfully!');
        
        // Apply theme change immediately (simplified example)
        if (preferences.theme === 'dark') {
            document.body.classList.add('bg-gray-900', 'text-white');
        } else {
            document.body.classList.remove('bg-gray-900', 'text-white');
        }
    });
    
    // Notification function
    function showNotification(message, type = 'success') {
        notificationMessage.textContent = message;
        
        // Set color based on type
        if (type === 'error') {
            notificationToast.classList.remove('bg-success-color');
            notificationToast.classList.add('bg-danger-color');
        } else {
            notificationToast.classList.remove('bg-danger-color');
            notificationToast.classList.add('bg-success-color');
        }
        
        notificationToast.classList.remove('hidden');
        notificationToast.classList.add('show');
        
        setTimeout(() => {
            notificationToast.classList.remove('show');
            setTimeout(() => {
                notificationToast.classList.add('hidden');
            }, 300);
        }, 3000);
    }
    
    // Initialize
    showSection(personalInfoSection);
});