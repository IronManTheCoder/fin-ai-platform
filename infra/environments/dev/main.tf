provider "aws" {
  region = "us-east-1"
}

module "bedrock_gateway" {
  source = "../../modules/bedrock-gateway"
  environment = "dev"
}
