---
layout: page
title: "Categories"
permalink: /categories/
---

<h1 class="page-title">Daftar Kategori dan Postingan</h1>

<ul class="category-list">
  {% for category in site.categories %}
    <li class="category-item">
      <h2 class="category-title">{{ category[0] }}</h2>
      <ul class="post-list">
        {% for post in category[1] %}
          <li class="post-item">
            <a href="{{ site.baseurl }}{{ post.url }}" class="post-link">{{ post.title }}</a>
          </li>
        {% endfor %}
      </ul>
    </li>
  {% endfor %}
</ul>
