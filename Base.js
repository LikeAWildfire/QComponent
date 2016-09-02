/**
 * Created by ravenor on 30.06.16.
 */

/**
 * Some kind of namespace
 *
 * @type {{QObject: (QObject|exports|module.exports), Component: (AbstractComponent|exports|module.exports), Pipe: (Pipe|exports|module.exports)}}
 */
module.exports = {
    QObject: require('./Base/QObject'),
    Component: {
        AbstractComponent: require('./Base/Components/AbstractComponent'),
        UIComponent: require('./Base/Components/UIComponent'),
        ContentContainer: require('./Base/Components/ContentContainer'),
        mixins: {
            focusable: require('./Base/Mixins/focusable')
        },
        UI: {
            Fields: {
                Base: require('./Base/Components/UI/Field/Base')
            },
            Primitives: require('./Base/Components/UI/Primitives'),
            Checkbox: require('./Base/Components/UI/Checkbox'),
            TextBox: require('./Base/Components/UI/TextBox'),
            MaskedInput: require('./Base/Components/UI/MaskedInput'),
            ListBox: require('./Base/Components/UI/ListBox'),
            WrapPanel: require('./Base/Components/UI/WrapPanel'),
            HBox: require('./Base/Components/UI/HBox'),
            NumberKeyboard: require('./Base/Components/UI/NumberKeyboard'),
            Slider: require('./Base/Components/UI/Slider'),
            Page: require('./Base/Components/UI/Page'),
            VBox: require('./Base/Components/UI/VBox'),
            Image: require('./Base/Components/UI/Image'),
            GeoMap: require('./Base/Components/UI/GeoMap'),
            GeoMapGoogle: require('./Base/Components/UI/GeoMapGoogle'),
            CardForm: require('./Base/Components/UI/CardForm'),
            DOMTools: require('./Base/Common/UI/DOMTools'),
            If: require('./Base/Components/UI/If')
        },
        Factory: require('./Base/Components/Factory'),
        Logical: {
            LogicalComponent: require('./Base/Components/Logical/LogicalComponent'),
            Branch: require('./Base/Components/Logical/Branch'),
            Gate: require('./Base/Components/Logical/Gate'),
            Timer: require('./Base/Components/Logical/Timer'),
            Random: require('./Base/Components/Logical/Random'),
            Title: require('./Base/Components/Logical/Title'),
            HTTPRequest: require('./Base/Components/Logical/HTTPRequest')
        }
    },
    EventManager: require('./Base/EventManager'),
    Property: require('./Base/Property'),
    Pipes: {
        AbstractPipe: require('./Base/Pipes/AbstractPipe'),
        SimplePipe: require('./Base/Pipes/SimplePipe'),
        FiltratingPipe: require('./Base/Pipes/FiltratingPipe'),
        MutatingPipe: require('./Base/Pipes/MutatingPipe')
    }
};
