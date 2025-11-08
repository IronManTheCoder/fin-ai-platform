variable "environment" {
  type = string
}

variable "lambda_zip_path" {
  type = string
}

variable "lambda_handler" {
  type    = string
  default = "handler"
}

variable "lambda_runtime" {
  type    = string
  default = "nodejs20.x"
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "lambda_memory" {
  type    = number
  default = 512
}

variable "lambda_timeout" {
  type    = number
  default = 15
}

variable "groq_api_key" {
  type        = string
  default     = ""
  description = "Optional Groq API key for fallback support"
  sensitive   = true
}
