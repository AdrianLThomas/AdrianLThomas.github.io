const fullWindowWidth = (backgroundColor = '#1a202c') => (`
    width: 100vw;
    position: relative;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
    background-color: ${backgroundColor};
`)

export {fullWindowWidth}