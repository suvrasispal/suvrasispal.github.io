#!/usr/bin/env python3
"""
set-admin-login.py — set the admin username and password on tca-print-studio.html.

The password is written as a SHA-256 hash, so the plain password does not
appear anywhere in the file.

Usage:
    python3 set-admin-login.py tca-print-studio.html USERNAME [PASSWORD]

If PASSWORD is omitted you are prompted for it without it being echoed.

Note on what this does and does not do: the check runs in the browser, so it
keeps the tool away from people who should not be poking at it, but it is not
real access control — see "Security" in the README.
"""

import getpass
import hashlib
import re
import shutil
import sys


def main():
    if len(sys.argv) < 3:
        raise SystemExit(__doc__.strip())

    path, user = sys.argv[1], sys.argv[2]
    if len(sys.argv) > 3:
        pw = sys.argv[3]
    else:
        pw = getpass.getpass("New password: ")
        if pw != getpass.getpass("Confirm password: "):
            raise SystemExit("Passwords did not match — nothing changed.")
    if not pw:
        raise SystemExit("Empty password — nothing changed.")

    html = open(path, "r", encoding="utf-8").read()
    if "var TCA_AUTH" not in html:
        raise SystemExit("No TCA_AUTH block found. Is this the built studio file?")

    digest = hashlib.sha256(pw.encode("utf-8")).hexdigest()

    block = (
        "var TCA_AUTH = {\n"
        "  user: '%s',\n"
        "  pass: '',\n"
        "  passSha256: '%s'\n"
        "};" % (user.replace("'", "\\'"), digest)
    )

    new, n = re.subn(r"var TCA_AUTH = \{.*?\n\};", block, html, count=1, flags=re.S)
    if n != 1:
        raise SystemExit("Could not rewrite the TCA_AUTH block — file may be modified.")

    shutil.copy(path, path + ".bak")
    open(path, "w", encoding="utf-8").write(new)

    print("Updated %s" % path)
    print("  username: %s" % user)
    print("  password: stored as SHA-256 (%s…)" % digest[:16])
    print("  backup:   %s.bak" % path)
    print("\nAnyone already signed in keeps their session until they close the tab.")


if __name__ == "__main__":
    main()
