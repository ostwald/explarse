var PARSER = (function () {

    var STACK = []

    function getCurrent() {
        return STACK[STACK.length - 1];
    }

    /*
     STACK.push('A')
     STACK.push('B')
     log (stringify(STACK))
     var foo = STACK.pop()
     log ('popped: ' + foo)
     log (stringify(STACK))
     */

    function getComposite() {
        return {
            children: [],
            connector: null
        }
    }

    function getFieldExpr(field, value) {
        return {
            field: field,
            value: value
        }
    }

    var FIELD;
    var IN_VALUE;
    var TOKEN_BUFFER;
    var IN_QUOTE;
    var IN_NONE_SINGLETON;

    function parse(s) {
        log("parse " + s)

        FIELD = null;
        IN_VALUE = false;
        TOKEN_BUFFER = "";
        IN_QUOTE = false;
        IN_DATE = false;
        IN_NONE_SINGLETON = false;
        STACK = []

        // preprocess
        if (s[0] == '(')
            s = s.slice(1);

        var root = getComposite();
        STACK.push(root);

        for (var i = 0; i < s.length; i++) {
            var ch = s[i];
//            log(ch);

            if (ch == ' ') {
                if (IN_QUOTE || IN_DATE)
                    TOKEN_BUFFER += ch;
                else
                    handle_end_token();
            }
            else if (ch == '!') {
                // if we are infront of a '(' this is NONE compound
                if (i < s.length - 1) {
                    if (i == 0) {
                        if (s[i + 1] == '(') {
                           getCurrent().connector = 'NONE'
                           i++;
                        }
                        else {
                            IN_NONE_SINGLETON = true;
                            getCurrent().connector = 'NONE'
                        }
                    }
                    else if (s[i + 1] == '(') {
                        handle_begin_compound('NONE');
                        i++;
                    }

                    else { // ASSUMING it's a simpleton ..
                        var comp = handle_begin_compound('NONE');
                        IN_NONE_SINGLETON = true;
                    }
                    // if we are NOT in front of '(' this is a singleton NONE compount
                }
            }
            else if (ch == ':' && !IN_DATE) {
                handle_end_field()
            }
            else if (ch == "\"") {
                handle_quote();
            }
            else if (ch == "[") {
                handle_begin_bracket();
            }
            else if (ch == "]") {
                handle_end_bracket();
            }
            else if (ch == '(') {
                handle_begin_compound();
            }
            else if (ch == ')') {
                handle_end_compound();
            }
            else if (ch == '*') {
                TOKEN_BUFFER += ch;
            }
            else {
                TOKEN_BUFFER += ch;
            }
        }
        if (IN_VALUE && TOKEN_BUFFER) {
//            log ("LEFT over token_buffer: '" + TOKEN_BUFFER + "'")
//            log (" - IN_NONE_SINGLETON: " + IN_NONE_SINGLETON)
            handle_end_value(TOKEN_BUFFER)

            if (!IN_NONE_SINGLETON)
                handle_end_compound()
        }
        return root;
    }

    function handle_begin_compound(connector) {
        handle_end_token();
        tos = getCurrent();
        comp = getComposite();
        if (connector)
            comp.connector = connector;
        tos.children.push(comp);
        STACK.push(comp);
        return comp;
    }

    function handle_end_compound() {
        var current = getCurrent();
        if (current && !current.connector)
            current.connector = "ALL"
        STACK.pop()
    }

    function handle_end_token() {
        log ('- handle_end_token() => ' + TOKEN_BUFFER);
        token = TOKEN_BUFFER.trim();
        TOKEN_BUFFER = '';
        if (token == '*' && IN_VALUE) {
            handle_end_value('*');
        }
        else if (token == 'ALL') {
            getCurrent().connector = token;
        }
        else if (token == "OR") {
            if (!getCurrent().connector)
                getCurrent().connector = 'ANY'
        }
        return token;
    }

    function handle_end_field() {
        // log ('- handle_end_field()');
        FIELD = handle_end_token();
//        log ('handle_end_field: ' + FIELD)
        IN_VALUE = true;
    }

    function handle_end_value(value) {
        log ('- handle_end_value()');
        log ("   provided value: " + value)
        log ("   TOKEN_BUFFER: " + TOKEN_BUFFER)
        if (value) {
            TOKEN_BUFFER = '';
        }
        else {
            value = handle_end_token();
        }
        var current = getCurrent();
//        log ("end_value: " + value)
        current.children.push(getFieldExpr(FIELD, value));
        IN_VALUE = false;
        if (IN_NONE_SINGLETON) {
            STACK.pop()
            IN_NONE_SINGLETON = false;
        }
    }

    function handle_begin_bracket () {
        if (!IN_QUOTE) {
            IN_DATE = true;
            TOKEN_BUFFER += '['
        }
    }

    function handle_end_bracket () {
        if (!IN_QUOTE) {
            log ("handle_end_bracket")
            IN_DATE = false;
            TOKEN_BUFFER += ']'
            handle_end_value();
        }
    }

    function handle_quote() {
        // log ('- handle_quote()');
        if (IN_QUOTE) {
            value = handle_end_value();
            //VALUE = value;
            IN_QUOTE = false;
            IN_VALUE = false;
        }
        else {
            TOKEN_BUFFER = '';
            IN_QUOTE = true;
            IN_VALUE = true;
        }
    }

    return {parse: parse};

}());
