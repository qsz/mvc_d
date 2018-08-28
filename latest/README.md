* autoprefixer注释示例
* http://npm.taobao.org/package/autoprefixer
>
.a {
    transition: 1s; /* it will be prefixed */
}
>
.b {
    /* autoprefixer: off */
    transition: 1s; /* it will not be prefixed */
}
>
.c {
    /* autoprefixer: ignore next */
    transition: 1s; /* it will not be prefixed */
    mask: url(image.png); /* it will be prefixed */
}
