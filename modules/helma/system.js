/**
 * A module to access and manipulate the rhino engine running this application
 */

require('core/object');
import('helma/logging');

export('addHostObject',
        'addRepository',
        'evaluate',
        'extendJavaClass',
        'getRepositories',
        'getRhinoContext',
        'getRhinoEngine',
        'setRhinoOptimizationLevel',
        'args');

var log = helma.logging.getLogger(__name__);

// mark this module as shared between all requests
var __shared__ = true;

function addHostObject(javaClass) {
    getRhinoEngine().defineHostClass(javaClass);
}

function extendJavaClass(javaClass) {
    return getRhinoEngine().getExtendedClass(javaClass);
}

/**
 * Get the Rhino optimization level for the current thread and context.
 * The optimization level is an integer between -1 (interpreter mode)
 * and 9 (compiled mode, all optimizations enabled). The default level
 * is 0.
 * @return level an integer between -1 and 9
 */
function getRhinoOptimizationLevel() {
    getRhinoEngine().getOptimizationLevel();    
}

/**
 * Set the Rhino optimization level for the current thread and context.
 * The optimization level is an integer between -1 (interpreter mode)
 * and 9 (compiled mode, all optimizations enabled). The default level
 * is 0.
 * @param level an integer between -1 and 9
 */
function setRhinoOptimizationLevel(level) {
    getRhinoEngine().setOptimizationLevel(level);
}

/**
 * Evaluate a module script on an existing scope instead of creating a
 * new module scope. This can be used to mimic traditional JavaScript
 * environments such as those found in web browsers.
 * @param moduleName the name of the module to evaluate
 * @param scope the JavaScript object to evaluate the script on
 */
function evaluate(moduleName, scope) {
    if (!scope) {
        // create a new top level scope object
        scope = {};
        scope.__parent__ = null;
        scope.__proto__ = Object.__parent__;
    }
    getRhinoEngine()
            .getScript(moduleName)
            .evaluate(scope, getRhinoContext());
    return scope;
}

/**
 * Get the org.mozilla.javascript.Context associated with the current thread.
 */
function getRhinoContext() {
    var Context = org.mozilla.javascript.Context;
    return Context.getCurrentContext();
}

/**
 * Get the org.helma.javascript.RhinoEngine associated with this application.
 */
function getRhinoEngine() {
    return getRhinoContext().getThreadLocal("engine");
}

/**
 * Get the app's module search path as list of repositories.
 */
function getRepositories() {
    return new ScriptableList(getRhinoEngine().getRepositories());
}

/**
 * Add a repository to the module search path
 * @param repo a repository
 */
function addRepository(repo) {
    if (typeof repo == "string") {
        repo = new org.helma.repository.FileRepository(repo);
    }
    var path = getRepositories();
    if (repo.exists() && !path.contains(repo)) {
        path.add(Math.max(0, path.length) - 1, repo);
    }
}

Object.defineProperty(this, "args", {
    value: new ScriptableList(getRhinoEngine().getCommandLineArguments())
});
