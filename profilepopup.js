(function() {
    function initProfilePopover() {
        const headerRight = document.querySelector('.header-right');
        if (!headerRight) return;

        // 1️⃣ Inject CSS for popover (matching bell style)
        const style = document.createElement('style');
        style.innerHTML = `
        /* Popover container */
        .profile-widget { position: relative; display: inline-block; margin-left: 10px; }

        /* Trigger button like bell */
        .profile-trigger {
            background: none;
            background-color: #E8A5A5;
            border: none;
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            color: #f7f4f4ff; /* same as bell icon */
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }
        .profile-trigger:hover { background-color: #e58a8aff; }

        /* Popover */
        .profile-popover {
            display: none;
            position: absolute;
            top: 50px;
            right: 0;
            width: 280px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 5px 20px #000;
            padding: 20px;
            z-index: 100;
            border: 1px solid #ddd;
            transform: scale(0.95);
            opacity: 0;
            transition: all 0.18s ease;
        }
        .profile-popover.active {
            display: block;
            transform: scale(1);
            opacity: 1;
        }

        /* Popover header */
        .popover-header { display: flex; align-items: flex-start; margin-bottom: 20px; position: relative; }
        .user-info { margin-left: 12px; }
        .user-name { font-weight: 700; font-size: 16px; color: #333; margin: 0; }
        .user-badge { display: inline-block; background-color: #e58a8aff; color: #eee; font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: 600; margin-top: 4px; }
        .close-btn { position: absolute; top: 0; right: 0; cursor: pointer; font-size: 14px; color: #555; }
        .close-btn:hover { color: #d32f2f; }

        /* Card link inside popover */
        .profile-card-link { display: block; text-decoration: none; border: 1px solid #eee; border-radius: 10px; padding: 15px; text-align: center; transition: background 0.2s; color: #333; margin-top: 10px; }
        .profile-card-link:hover { background-color: #f9f9f9; border-color: #ddd; }
        .card-icon { color: #d32f2f; font-size: 20px; margin-bottom: 8px; }
        .card-title { display: block; font-weight: 700; font-size: 14px; margin-bottom: 4px; }
        .card-subtitle { display: block; font-size: 10px; color: #888; line-height: 1.4; }
        `;
        document.head.appendChild(style);

        // 2️⃣ Remove the old profile button (static one)
        const oldProfileBtn = headerRight.querySelector('.icon-button:last-child');
        if (oldProfileBtn) oldProfileBtn.remove();

        // 3️⃣ Inject new profile widget button with popover
        const popoverHTML = document.createElement('div');
        popoverHTML.classList.add('profile-widget');
        popoverHTML.innerHTML = `
    <button class="profile-trigger" id="profileBtn">
        <i class="fas fa-user"></i>
    </button>

    <div class="profile-popover" id="profileMenu">
        <div class="popover-header">
            <div class="avatar-circle"><i class="fas fa-user"></i></div>
            <div class="user-info">
                <h3 class="user-name">Student1</h3>
                <span class="user-badge">Student</span>
            </div>
            <i class="fa-solid fa-arrow-left close-btn" id="closeBtn"></i>
        </div>
        <a href="Profilepage.html" class="profile-card-link">
            <i class="fa-solid fa-user card-icon"></i>
            <span class="card-title">My Profile</span>
            <span class="card-subtitle">View and manage your personal info, account settings, and preferences</span>
        </a>
    </div>

        `;
        headerRight.appendChild(popoverHTML);

        // 4️⃣ JS interactions
        const profileBtn = document.getElementById('profileBtn');
        const profileMenu = document.getElementById('profileMenu');
        const closeBtn = document.getElementById('closeBtn');

        profileBtn.addEventListener('click', e => {
            e.stopPropagation();
            profileMenu.classList.toggle('active');
        });

        closeBtn.addEventListener('click', e => {
            e.stopPropagation();
            profileMenu.classList.remove('active');
        });

        document.addEventListener('click', e => {
            if (!profileMenu.contains(e.target) && !profileBtn.contains(e.target)) {
                profileMenu.classList.remove('active');
            }
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') profileMenu.classList.remove('active');
        });
    }

    document.addEventListener('DOMContentLoaded', initProfilePopover);
})();
