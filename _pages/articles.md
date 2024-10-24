---
layout: page
title: "Articles"
permalink: /articles/
---

<h1 class="page-title">Daftar Artikel Terbaru</h1>

<div class="card-container">
  {% assign sorted_posts = site.posts | sort: 'date' | reverse %} <!-- Mengurutkan postingan berdasarkan tanggal -->
  {% for post in sorted_posts limit: 20 %} <!-- Batasi jumlah postingan yang ditampilkan -->
    <div class="card">
      <h2 class="card-title">{{ post.title }}</h2>
      <p class="post-date">Dipublikasikan pada: <time datetime="{{ post.date | date: "%Y-%m-%d" }}">{{ post.date | date: "%B %d, %Y" }}</time></p>
      <p class="card-excerpt">{{ post.excerpt | strip_html | truncate: 150 }}</p> <!-- Cuplikan postingan -->
      <a class="read-more" href="{{ site.baseurl }}{{ post.url }}">Baca Selengkapnya</a> <!-- Tombol Baca Selengkapnya -->
    </div>
  {% endfor %}
</div>
