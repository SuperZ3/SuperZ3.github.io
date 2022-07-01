# React-Router

react-router 用来管理单页应用的路由，没啥逻辑，后续再补充解释

## BrowserRouter & Link

```javascript
// routercontext
const RouterContext = createContext()
export default RouterContext
// routercontext

import React, { Component, createContext, useContext } from 'react'
import { createBrowserHistory } from 'history';
import Router from './router'
import RouterContext from './context';

export class BrowserRouter extends Component {
    history = createBrowserHistory(this.props)
    render() {
        return <Router history={this.history} children={this.props.children}/>
    }
}
export function Link({
    to,
    component,
    children,
    ...extra
}) {
    const { history } = useContext(RouterContext)
    const handleClick = (e) => {
        e.preventDefault()
        history.push(to)
    }
    return <a href={to} onClick={handleClick} {...extra}>
        {
            component ? component : children
        }
    </a>
}
```

## Router

```javascript
import React, { Component } from "react";
import RouterContext from './context';

export default class Router extends Component {
    static computedRootMatch(pathname) {
        return { path: "/", url: "/", params: {}, isExact: pathname === "/" };
    }
    constructor(props) {
        super(props)

        this.state = {
            location : props.history.location
        }

        this.unlisten = props.history.listen(location => this.setState({location}))
    }
    componentWillUnmount() {
        this.unlisten()
    }
    render() {
        return (
            <RouterContext.Provider value={{
                history: this.props.history, 
                location: this.state.location,
                match: Router.computeRootMatch(this.state.location.pathname),
            }}>
                {this.props.children}
            </RouterContext.Provider>
        )
    }
}
```

## Route

```javascript
import React, { Component } from 'react'
import pathToRegexp from "path-to-regexp";
import RouterContext from './context'

function compilePath(path, options) {
    const keys = []
    const regexp = pathToRegexp(path, keys, options);
    const result = { regexp, keys };
    return result
}

export function matchPath(pathname, options = {}) {
    const { path, exact = false, strict = false, sensitive = false } = options
    
    const paths = [].concat(path)
    return paths.reduce((matched, path) => {
        if (matched) return matched
        const { regexp, keys } = compilePath(path, {
            end: exact,
            strict,
            sensitive
        })
        const match = regexp.exec(pathname);
        if (!match) return null;

        const [url, ...values] = match;
        const isExact = pathname === url;

        if (exact && !isExact) return null;

        return {
            path,
            url: path === "/" && url === "" ? "/" : url,
            isExact,
            params: keys.reduce((memo, key, index) => {
                memo[key.name] = values[index];
                return memo;
            }, {})
        }
    }, null)
}

export default class Route extends Component {
    render() {
        return (
            <RouterContext.Consumer>
                {context => {
                    const { location } = context
                    const { path, children, component, render, computedMatch } = this.props
                    const match = computedMatch 
                        ? computedMatch
                        : path 
                            ? matchPath(location.pathname, this.props)
                            : context.match

                    const props = {...context, match}

                    // children > component > render
                    return (
                        <RouterContext.Provider value={props}>
                            {match
                                ? children
                                    ? typeof children === 'function'
                                        ? children(props)
                                        : children
                                    : component
                                        ? React.createElement(component, props)
                                        : render
                                            ? render()
                                            : null
                                : typeof children === 'function'
                                    ? children(props)
                                    : null}
                        </RouterContext.Provider>
                    )
                }}
            </RouterContext.Consumer>
        )
    }
}
```

## Switch

```javascript
import React, { Component } from 'react'
import { matchPath } from './route'
import RouterContext from './context'

export default class Switch extends Component {
    render() {
        return (
            <RouterContext.Consumer>
                {context => {
                    const location = this.props.location || context.location
                    let matched, element
                    React.Children.forEach(this.props.children, child => {
                        if (!matched && React.isValidElement(child)) {
                            element = child
                            const path = child.props.path
                            matched = path ? matchPath(location.pathname, { ...child.props, path }) : context.matched
                        }
                    })

                    return matched ? React.cloneElement(element, { location, computedMatch: matched }) : null
                }}
            </RouterContext.Consumer>
        )
    }
}
```

## NavLink

```javascript
import React, { Component } from 'react'
import RouterContext from './context'
import { Link } from './browserRouter'

function NavLink({
    to,
    className: classNameProp,
    activeClassName,
    style: styleProp,
    isActive: isActiveProp,
    activeStyle,
    ...exact
}) {
    return (
        <RouterContext.Consumer>
            {context => {
                const { match, location } = context
                const isActive = !!(isActiveProp ? isActiveProp(match, location) : match)
                let className = typeof classNameProp === 'function' ? classNameProp(isActive) : classNameProp
                let style = typeof styleProp === 'function' ? styleProp(isActive) : styleProp
                if (isActive) {
                    className = [...className, ...activeClassName].join('')
                    style = {...style, ...activeStyle}
                }

                const props = {
                    ...exact,
                    className,
                    style,
                    to,
                }
                return <Link {...props}/>
            }}
        </RouterContext.Consumer>
    )
}
```

## hooks

```javascript
import { useContext } from "react";
import RouterContext from "./context";

export function useLocation() {
    return useContext(RouterContext).location
}
export function useHistory() {
    return useContext(RouterContext).history
}
export function useParams() {
    const match = useContext(RouterContext).match
    return match ? match.params : {}
}
export function useRouteMatch() {
    return useContext(RouterContext).match
}
```

## Redirect

```javascript
import React, { Component } from 'react'
import RouterContext from './context'

class Lifecycle extends Component {
    onMounted() {
        this.props.onMounted.call(this)
    }
    render() {
        return null
    }
}

function Redirect({ to, push = false }) {
    return (
        <RouterContext.Consumer>
            {context => {
                const history = context.history
                const method = push ? history.push : history.replace
                return <Lifecycle onMounted={() => method(to)} />
            }}
        </RouterContext.Consumer>
    )
}

export default Redirect
```
