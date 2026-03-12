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
