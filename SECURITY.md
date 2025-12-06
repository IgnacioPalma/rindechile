# Security Policy

## Reporting Security Vulnerabilities

We take the security of Transparenta seriously. If you discover a security vulnerability, we appreciate your help in disclosing it to us in a responsible manner.

### How to Report a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them by emailing us at:

**[Your Email Address Here]** <!-- Replace with actual contact email -->

Please include the following information in your report:

- **Description**: A clear description of the vulnerability
- **Impact**: The potential impact of the vulnerability
- **Steps to Reproduce**: Detailed steps to reproduce the vulnerability
- **Proof of Concept**: If possible, include a proof of concept (code, screenshots, etc.)
- **Suggested Fix**: If you have suggestions for how to fix the vulnerability, please include them

### What to Expect

After you submit a vulnerability report, we will:

1. **Acknowledge** your email within 48 hours
2. **Investigate** the issue and determine its severity
3. **Develop a fix** if the vulnerability is confirmed
4. **Release** a security update
5. **Credit** you for the discovery (unless you prefer to remain anonymous)

### Security Update Process

- Security fixes will be released as soon as possible after verification
- We will publish a security advisory on GitHub when appropriate
- Critical vulnerabilities will be prioritized and patched immediately

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

We recommend always using the latest version to ensure you have the most recent security updates.

## Security Best Practices

When deploying Transparenta:

1. **Environment Variables**: Never commit `.env` files or hardcode credentials
2. **Database Credentials**: Rotate Cloudflare D1 API tokens regularly
3. **Access Control**: Restrict database access to authorized users only
4. **Updates**: Keep dependencies up to date
5. **Monitoring**: Monitor application logs for suspicious activity

## Known Security Considerations

- **Public Data**: This application displays public Chilean government procurement data
- **API Rate Limiting**: Currently no built-in rate limiting - configure at Cloudflare Workers level
- **Input Validation**: All API endpoints validate input parameters to prevent injection attacks

## Attribution

We believe in responsible disclosure and will acknowledge security researchers who help us improve Transparenta's security.

---

For general questions or support, please open a GitHub issue. For security vulnerabilities, please use the private reporting method described above.
