(() => {
	const root = document.documentElement;
	const themeToggle = document.getElementById('theme-toggle');
	const storageKey = 'preferred-theme';
	const cookieKey = 'preferred-theme';
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	const windowNamePrefix = 'theme=';

	function readCookieTheme() {
		const cookieString = document.cookie || '';
		const cookies = cookieString.split(';').map((entry) => entry.trim());
		const match = cookies.find((entry) => entry.startsWith(`${cookieKey}=`));

		if (!match) {
			return null;
		}

		const value = decodeURIComponent(match.split('=').slice(1).join('='));
		return value === 'light' || value === 'dark' ? value : null;
	}

	function writeCookieTheme(theme) {
		document.cookie = `${cookieKey}=${encodeURIComponent(theme)}; path=/; max-age=31536000; SameSite=Lax`;
	}

	function isDarkPreferred() {
		return mediaQuery.matches;
	}

	function syncToggle(theme) {
		if (!themeToggle) {
			return;
		}
		themeToggle.checked = theme === 'dark';
	}

	function applyTheme(theme) {
		if (theme === 'light' || theme === 'dark') {
			root.setAttribute('data-theme', theme);
			syncToggle(theme);
			return;
		}

		root.removeAttribute('data-theme');
		syncToggle(isDarkPreferred() ? 'dark' : 'light');
	}

	function readWindowNameTheme() {
		if (typeof window.name !== 'string' || !window.name.startsWith(windowNamePrefix)) {
			return null;
		}

		const stored = window.name.slice(windowNamePrefix.length);
		return stored === 'light' || stored === 'dark' ? stored : null;
	}

	function writeWindowNameTheme(theme) {
		window.name = `${windowNamePrefix}${theme}`;
	}

	function getStoredTheme() {
		const cookieTheme = readCookieTheme();
		if (cookieTheme) {
			return cookieTheme;
		}

		try {
			const stored = localStorage.getItem(storageKey);
			if (stored === 'light' || stored === 'dark') {
				return stored;
			}
		} catch (error) {
			// Some contexts (privacy mode/file origin) can block web storage.
		}

		return readWindowNameTheme();
	}

	function storeTheme(theme) {
		writeCookieTheme(theme);

		try {
			localStorage.setItem(storageKey, theme);
		} catch (error) {
			// Fallback in contexts where localStorage is unavailable.
		}

		writeWindowNameTheme(theme);
	}

	applyTheme(getStoredTheme());

	if (themeToggle) {
		themeToggle.addEventListener('change', () => {
			const selectedTheme = themeToggle.checked ? 'dark' : 'light';
			storeTheme(selectedTheme);
			applyTheme(selectedTheme);
		});
	}

	mediaQuery.addEventListener('change', () => {
		if (!getStoredTheme()) {
			applyTheme(null);
		}
	});

	const mobileToggleQuery = window.matchMedia('(max-width: 767px)');
	let lastScrollY = window.scrollY;
	let isTicking = false;

	function setToggleVisibilityOnMobile(isHidden) {
		document.body.classList.toggle('theme-toggle-hidden', isHidden);
	}

	function updateToggleFromScroll() {
		if (!mobileToggleQuery.matches) {
			setToggleVisibilityOnMobile(false);
			lastScrollY = window.scrollY;
			isTicking = false;
			return;
		}

		const currentY = window.scrollY;

		if (currentY <= 24) {
			setToggleVisibilityOnMobile(false);
		} else if (currentY > lastScrollY + 6) {
			setToggleVisibilityOnMobile(true);
		} else if (currentY < lastScrollY - 6) {
			setToggleVisibilityOnMobile(false);
		}

		lastScrollY = currentY;
		isTicking = false;
	}

	function handleScroll() {
		if (isTicking) {
			return;
		}

		isTicking = true;
		window.requestAnimationFrame(updateToggleFromScroll);
	}

	window.addEventListener('scroll', handleScroll, { passive: true });
	mobileToggleQuery.addEventListener('change', updateToggleFromScroll);
	updateToggleFromScroll();
})();

(() => {
	const panels = Array.from(document.querySelectorAll('.filter-panel[data-filter]'));
	const posts = Array.from(document.querySelectorAll('.material-card[data-tags]'));
	const status = document.getElementById('teaching-filter-status');
	const timelineSection = document.querySelector('.teaching-timeline');

	if (!panels.length || !posts.length) {
		return;
	}

	let activeFilter = null;

	function updateStatus(matchCount) {
		if (!status) {
			return;
		}

		if (!activeFilter) {
			status.textContent = 'Showing all posts. Select a panel above to filter.';
			return;
		}

		const activeLabel = panels.find((panel) => panel.dataset.filter === activeFilter)?.querySelector('h3')?.textContent?.trim() || activeFilter;
		status.textContent = `Showing ${matchCount} post${matchCount === 1 ? '' : 's'} for ${activeLabel}. Click the same panel again to reset.`;
	}

	function applyFilter() {
		if (timelineSection) {
			timelineSection.hidden = Boolean(activeFilter);
		}

		panels.forEach((panel) => {
			const isActive = panel.dataset.filter === activeFilter;
			panel.classList.toggle('is-active', isActive);
			panel.setAttribute('aria-pressed', String(isActive));
		});

		let visibleCount = 0;

		posts.forEach((post) => {
			const tags = (post.dataset.tags || '').toLowerCase().split(/\s+/).filter(Boolean);
			const matches = !activeFilter || tags.includes(activeFilter);
			post.hidden = !matches;
			if (matches) {
				visibleCount += 1;
			}
		});

		updateStatus(visibleCount);
	}

	function handleFilter(filterValue) {
		activeFilter = activeFilter === filterValue ? null : filterValue;
		applyFilter();
	}

	panels.forEach((panel) => {
		const filterValue = (panel.dataset.filter || '').toLowerCase();

		panel.addEventListener('click', () => handleFilter(filterValue));
		panel.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				handleFilter(filterValue);
			}
		});
	});

	applyFilter();
})();
