/**
 * Author : Der (http://www.ueder.net)
 * Date : 2012/04/02
 */

//window 以参数方式传进来，沙箱模式，
//undefined定为局部变量，提高性能, 以及防止被恶意修改
;(function(window, undefined) { 

    //使document指向参数window里的document
    var document = window.document,
        location = document.location;

    /**
     * Slides 构造函数
     */
    var Slides = function() {

        //支持 Slides()直接调用
        if (!(this instanceof Slides)) {
            return new Slides();
        }

        //统一配置在这里
        var container = '#slides', //slides的容器选择器
            pages = '.page', //所有slide页选择器
            pageClass = 'page', //slide页的className
            hashPrefix = 'slide-', //hash里的前缀，后面为页值
            prev = '#prev', //前一页按钮
            next = '#next'; //后一页按钮

        //程序内部数据
        this.container = document.querySelector(container); //slides的容器
        this.pages = this.container.querySelectorAll(pages); //所有slide页
        this.prevBtn = document.querySelector(prev); //上一页按钮
        this.nextBtn = document.querySelector(next); //下一页按钮
        this.hashPrefix = hashPrefix; //hash前缀
        this.currentPage = 1; //默认在第一页
        this.totalPages = this.pages.length; //ppt总页数
        this.pageClass = pageClass;

        this.init();
        
    };

    /**
     * 扩展构造函数
     * @type {Object}
     */
    Slides.prototype = {

        /**
         * 还原contructor
         * @type {Function}
         */
        constructor: Slides, 

        /**
         * 初始化
         * @return {undefined} 
         */
        init: function() {
            var self = this;

            self.bindUI(); //用户事件绑定
            self.currentPage = self._getPageFromHash(); //从hash获取在第几页
            self.goto(self.currentPage); //跳转到第几页
            self._setPageToHash(self.currentPage); //设置hash状态

        },

        /**
         * 事件绑定
         * @return {undefined} 
         */
        bindUI: function() {
            var self = this;

            //前一页
            this.prevBtn.addEventListener('click', function(e) {
                e.preventDefault();
                self.prev();
            }, false);

            //后一页
            this.nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                self.next();
            }, false);

            // onhashchange handle 哈希驱动事件
            // 所有的上一页下一页跳转到几页都只改变hash值，然后由hashchange事件驱动页面跳转
            window.addEventListener('hashchange', function(e) {
                var cp = self._getPageFromHash();
                self.currentPage = cp;
                self.goto(cp);
            }, false);

            //添加键盘事件
            window.addEventListener('keydown', function(e) {

                switch (e.keyCode) {
                    case 39: // right arrow
                    case 40: // down arrow
                    case 13: // Enter
                    case 32: // space
                    case 34: // PgDn
                        self.next();
                        break;

                    case 37: // left arrow
                    case 38: // top arrow
                    // case 8: // Backspace
                    case 33: // PgUp
                    case 27: //Esc
                        self.prev();
                        break;
                }

            }, false)

        },

        /**
         * 从hash获取当前到第几页
         * @return {number} 返回第几页的数字
         */
        _getPageFromHash: function() {
            var self = this,
                hashPrefix = self.hashPrefix,
                tp = self.totalPages, //总slides数
                hash = location.hash.slice(1), //获取hash去掉#之后的字符串
                page = hashPrefix === '' ? hash : hash.split(hashPrefix)[1], //前缀为空直接取hash，否则取前缀之后的值
                pageN = parseInt(page, 10); //转为number

            //page为不合法或为0时，统一返回1
            if (isNaN(pageN) || pageN < 1) {
                pageN = 1;
            } 
            //page大于总slides数，统一返回最大slides数
            else if (pageN > tp) {
                pageN = tp;
            }

            return pageN;
        },

        /**
         * 设置hash
         * @param {number} n 设置hash到第n页
         */
        _setPageToHash: function(n) {
            var self = this,
                hashPrefix = self.hashPrefix;

            location.hash = '#' + hashPrefix + n;
        },

        /**
         * 跳转到第n页
         * @param  {number} n 跳转到的页数
         * @return {undefined}   
         */
        goto: function(n) {
            var self = this,
                pages = self.pages,
                pageClass = self.pageClass,
                cur = n - 1, //当前页, 转为0起始
                past = n - 2, //上一页
                pastFar = n - 3, //上上一页
                next = n, //下一页
                nextFar = n + 1, //下下一页
                i = 0, len = self.totalPages;

            //改变当前slide以及前后各两个slide的className，
            //再利用css3 的translate偏离位置 + transition动画
            for (; i < len; i++) {
                var page = pages[i];

                switch (i) {
                    case cur: 
                        page.className = pageClass + ' p-current';
                        break;

                    case past:
                        page.className = pageClass + ' p-past';
                        break;

                    case pastFar:
                        page.className = pageClass + ' p-past-far';
                        break;

                    case next:
                        page.className = pageClass + ' p-next';
                        break;

                    case nextFar:
                        page.className = pageClass + ' p-next-far';
                        break;

                    default:
                        page.className = pageClass;
                }
            }
        },

        /**
         * 前一页
         * @return {undefined} 
         */
        prev: function() {
            var cp = this.currentPage;

            if (cp === 1) return; //边界

            this.currentPage--;
            this._setPageToHash(this.currentPage);
        },

        /**
         * 后一页
         * @return {undefined} 
         */
        next: function() {
            var tp = this.totalPages,
                cp = this.currentPage;

            if (cp === tp) return; //边界

            this.currentPage++;
            this._setPageToHash(this.currentPage);
        }
    };

    //将Slides暴露到全局
    window.Slides = Slides;

})(window);