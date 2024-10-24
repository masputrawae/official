---
layout: page
title: "Archives"
permalink: /archives/
---

<div class="archive-header">
    <h1>Arsip</h1>
</div>

<ul class="archive-list">
    {% for post in site.posts %}
    <li class="archive-item">
        <a href="{{ post.url | relative_url }}" class="archive-link">{{ post.title }}</a>
        <p class="archive-date">{{ post.date | date: "%d %B %Y" }}</p> <!-- Tanggal artikel -->
    </li>
    {% endfor %}
</ul>
