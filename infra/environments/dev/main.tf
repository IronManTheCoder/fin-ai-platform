terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
    archive = { source = "hashicorp/archive", version = "~> 2.4" }
  }
}

provider "aws" { region = "us-east-1" }

# Zip the Lambda bundle (built JS)
data "archive_file" "platform_api_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../services/platform-api/dist/index.cjs"
  output_path = "${path.module}/.artifacts/platform-api.zip"
}

module "bedrock_gateway" {
  source         = "../../modules/bedrock-gateway"
  environment    = "dev"
  aws_region     = "us-east-1"
  lambda_zip_path = data.archive_file.platform_api_zip.output_path
  lambda_handler  = "index.handler"
  lambda_runtime  = "nodejs20.x"
}

output "api_url" {
  value = module.bedrock_gateway.api_endpoint
}
