// ==UserScript==
// @name         主页油猴化
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  真正的主页
// @author       pea0ce
// @match        https://pea0ce.github.io/*.md
// @match        https://pea0ce.github.io/*.md?*
// @grant        GM_xmlhttpRequest
// @require      https://unpkg.com/showdown/dist/showdown.min.js
// ==/UserScript==

(function() {
    'use strict';
    const newHTML = `<!DOCTYPE html>
<html lang="zh">

<head>
    <meta charset="UTF-8">
    <title>陋室</title>
    <style>
        div.line {
            width: 1000px;
            margin: 10px auto;
            padding-top: 10px;
            box-sizing: border-box;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(3, 300px);
            grid-gap: 20px;
        }

        .grid img {
            width: 300px;
            height: 230px;
        }

        div.fixed {
            position: fixed;
            top: 30px;
            right: 5px;
            text-align: right;
        }
    </style>
</head>

<body>
    <div class="fixed">
        <a href="https://pea0ce.github.io/">回主页</a><br>
    </div>
    <div class="line">
        <h1 class="title">一篇文章</h1>
    </div>
    <div class="line">写点什么</div>
    <script src="https://utteranc.es/client.js" repo="pea0ce/pea0ce.github.io" issue-term="pathname"
        theme="github-light" crossorigin="anonymous" async>
        </script>
</body>

</html>`;
    function convertMarkdownImages(markdownText) {
        return markdownText.replace(
            /!\[\[([^\]]+)\]\]/g,
            function(match, filename) {
                // 将空格替换为 %20
                let encodedFilename = filename.replace(/ /g, '%20');
                return `![图片描述](https://pea0ce.github.io/%E5%9B%BE/${encodedFilename})\n`;
            }
        );
    }
    // 等待页面完全加载
    window.addEventListener('load', function() {
        // 获取页面内容
        var pageContent = document.body.innerText || document.body.textContent;

        // 输出到控制台
        console.log('=== MD页面内容开始 ===');
        //pageContent = pageContent.replace(/!\[\[(.*?)\]\]/g, '![图片描述]($1)')
        console.log(pageContent);
        console.log('=== MD页面内容结束 ===');

        // 可选：在页面上显示提示信息
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #4CAF50;
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 10000;
            font-size: 14px;
        `;
        notification.textContent = 'MD内容已输出到控制台';
        document.body.appendChild(notification);

        // 3秒后移除提示
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
        pageContent = convertMarkdownImages(pageContent)
        pageContent = pageContent.replace(/\r?\n|\r/g, '\n\n')
        var converter = new showdown.Converter(),
            text      = '![图片描述](https://pea0ce.github.io/%E5%9B%BE/Pasted%20image%2020251025060818.png)',
            html      = converter.makeHtml(pageContent);

        document.body.innerHTML = newHTML;
        const path = window.location.pathname;
        // 分割路径并获取最后一个非空部分
        const pathParts = path.split('/').filter(part => part !== '');
        let lastPart = pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'home';
        // 对URL编码的部分进行解码
        lastPart = decodeURIComponent(lastPart).replace(/\.md$/, "");
        document.getElementsByClassName('title')[0].textContent = lastPart
        document.title = "陋室 > "+lastPart

        document.getElementsByClassName('line')[1].innerHTML = html

        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://api.github.com/repos/pea0ce/pea0ce.github.io/contents/%E5%BD%92%E6%A1%A3',
            onload: res => {
                // 直接把 JSON 打印到控制台
                console.log(JSON.parse(res.responseText).map(item => item.path));
                var list = JSON.parse(res.responseText).map(item => item.path)
                const linksHtml = list
                .map(file => {
                    // 把文件名里的空格转义，保留中文
                    const href = 'https://pea0ce.github.io/' + encodeURIComponent(file).replace(/%2F/g, '/');
                    const text = file.replace('归档/', '').replace('.md', ''); // 去掉前缀，只保留文件名
                    return `<a href="${href}" target="_blank">${text}</a><br>`;
                })
                .join('');

                /* 3. 插到“回主页”后面 */
                const fixedBox = document.querySelector('.fixed');
                if (fixedBox) {
                    fixedBox.insertAdjacentHTML('beforeend', linksHtml);
                }
            },
            onerror: err => console.error('请求失败', err)
        });
    });
})();