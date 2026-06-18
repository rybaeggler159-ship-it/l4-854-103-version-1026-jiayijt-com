(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-frame" href="' + escapeHtml(movie.url) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="card-badge">' + escapeHtml(movie.category) + '</span>',
      '    <span class="play-badge">▶</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <h2 class="card-title"><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
      '    <p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="card-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function setupSearchPage() {
    var list = qs('[data-search-results]');
    var count = qs('[data-search-count]');
    var input = qs('[data-search-input]');
    var year = qs('[data-search-year]');
    var region = qs('[data-search-region]');
    var type = qs('[data-search-type]');
    var data = window.SEARCH_INDEX || [];

    if (!list) {
      return;
    }

    var query = getParam('q');
    if (input) {
      input.value = query;
    }

    function unique(field) {
      var values = {};
      data.forEach(function (movie) {
        if (movie[field]) {
          values[movie[field]] = true;
        }
      });
      return Object.keys(values).sort().reverse();
    }

    function fillSelect(select, field, label) {
      if (!select) {
        return;
      }
      select.innerHTML = '<option value="">' + label + '</option>';
      unique(field).forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillSelect(year, 'year', '全部年份');
    fillSelect(region, 'region', '全部地区');
    fillSelect(type, 'type', '全部类型');

    function render() {
      var keyword = normalize(input && input.value);
      var yearValue = year ? year.value : '';
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var results = data.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine,
          movie.category
        ].join(' '));

        if (keyword && haystack.indexOf(keyword) === -1) {
          return false;
        }
        if (yearValue && movie.year !== yearValue) {
          return false;
        }
        if (regionValue && movie.region !== regionValue) {
          return false;
        }
        if (typeValue && movie.type !== typeValue) {
          return false;
        }
        return true;
      });

      if (!keyword && !yearValue && !regionValue && !typeValue) {
        results = data.slice(0, 60);
      }

      if (count) {
        count.textContent = String(results.length);
      }

      if (!results.length) {
        list.innerHTML = '<div class="result-empty">没有找到匹配内容，请更换关键词或筛选条件。</div>';
        return;
      }

      list.innerHTML = results.map(card).join('\n');
    }

    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', render);
        control.addEventListener('change', render);
      }
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', setupSearchPage);
})();
