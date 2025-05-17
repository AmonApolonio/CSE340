const errorController = {}

errorController.triggerError = function (req, res, next) {
  const err = new Error('This is an intentional server error!')
  err.status = 500
  next(err)
}

module.exports = errorController