'use strict';

module.exports = {
    processRequest: function (req) {
        var
            contentType = req.header('Content-Type'),
            accept = req.header('Accept'),
            hasJsonContentType = contentType &&
                                 contentType.indexOf('application/json') !== -1;
        if (accept == null) {
            req.header('Accept', 'application/json');
        }

        if (contentType != null && !hasJsonContentType) {
            return;
        }

        if (req.body) {
            if (!contentType) {
                req.header('Content-Type', 'application/json');
            }

            req.body = JSON.stringify(req.body);
        }
    }
};
