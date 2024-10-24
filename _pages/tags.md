---
layout: page
title: "Tags"
permalink: /tags/
---

<div class="tag-header">
    <h1>Tag</h1>
</div>

<ul class="tag-list">
    {% for tag in site.tags %}
    <li class="tag-item">
        <a href="{{ tag[1][0].url | relative_url }}" class="tag-link">{{ tag[0] }}</a> <!-- Menampilkan nama tag -->
    </li>
    {% endfor %}
</ul>
