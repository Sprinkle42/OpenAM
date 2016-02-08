/*
 * The contents of this file are subject to the terms of the Common Development and
 * Distribution License (the License). You may not use this file except in compliance with the
 * License.
 *
 * You can obtain a copy of the License at legal/CDDLv1.0.txt. See the License for the
 * specific language governing permission and limitations under the License.
 *
 * When distributing Covered Software, include this CDDL Header Notice in each file and include
 * the License file at legal/CDDLv1.0.txt. If applicable, add the following below the CDDL
 * Header, with the fields enclosed by brackets [] replaced by your own identifying
 * information: "Portions copyright [year] [name of copyright owner]".
 *
 * Copyright 2016 ForgeRock AS.
 */

define("org/forgerock/openam/ui/admin/views/realms/services/NewServiceView", [
    "jquery",
    "lodash",
    "org/forgerock/commons/ui/common/main/AbstractView",
    "org/forgerock/commons/ui/common/main/EventManager",
    "org/forgerock/commons/ui/common/main/Router",
    "org/forgerock/commons/ui/common/util/Constants",
    "org/forgerock/openam/ui/admin/services/SMSRealmService",
    "org/forgerock/openam/ui/admin/views/realms/services/renderForm",

    // jquery dependencies
    "bootstrap-tabdrop"
], function ($, _, AbstractView, EventManager, Router, Constants, SMSRealmService, renderForm) {

    return AbstractView.extend({
        template: "templates/admin/views/realms/services/NewServiceTemplate.html",
        events: {
            "click [data-save]": "onSave",
            "change #serviceSelection": "onServiceSelection"
        },

        render: function (args, callback) {
            this.data.realmPath = args[0];

            SMSRealmService.services.type.getCreatables(this.data.realmPath).then(_.bind(function (creatableTypes) {
                this.data.creatableTypes = creatableTypes.result;

                this.parentRender(function () {
                    this.$el.find("#serviceSelection").selectize();
                    if (callback) { callback(); }
                });
            }, this));
        },

        onServiceSelection: function (e) {
            var service = e.target.value;

            if (this.data.type !== service) {
                this.data.type = service;

                SMSRealmService.services.instance.getInitialState(this.data.realmPath)
                    .then(_.bind(function (initialState) {
                        this.data.schema = initialState.schema;
                        this.data.values = initialState.values;

                        renderForm(this.$el.find("[data-service-form-holder]"), this.data, _.bind(function (form) {
                            this.form = form;
                        }, this));
                    }, this));
            }
        },

        onSave: function () {
            SMSRealmService.services.instance.create().then(_.bind(function () {
                EventManager.sendEvent(Constants.EVENT_DISPLAY_MESSAGE_REQUEST, "changesSaved");

                Router.routeTo(Router.configuration.routes.realmsServiceEdit, {
                    args: _.map([this.data.realmPath, this.data.type], encodeURIComponent),
                    trigger: true
                });
            }, this));
        }
    });
});
